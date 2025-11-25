# pedidos/tests.py

from rest_framework.test import APITestCase
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import json

from .models import Producto, Auction, Bid

class AuctionFlowTests(APITestCase):
    
    # pedidos/tests.py (Función setUp corregida)

    def setUp(self):
        """Configura los usuarios y productos necesarios para todas las pruebas."""
        
        # 1. Crear Vendedor
        self.vendedor = User.objects.create_user(
            username='vendedor_test', password='password123'
        )
        
        # 2. Crear Comprador (Ofertante)
        self.comprador = User.objects.create_user(
            username='comprador_test', password='password123'
        )
        
        # 3. Crear Producto para la subasta
        self.producto = Producto.objects.create(
            nombre="Coche de Prueba",
            descripcion="Producto de prueba para subasta.",
            # Solo pasamos los campos definidos en el modelo:
            owner=self.vendedor,
            metodo_venta="DIRECTA"
            # Los campos 'tipo', 'precio', 'stock', y 'condicion' han sido eliminados.
        )
        
        # URLs base que usaremos
        self.auction_create_url = reverse('create_auction', kwargs={'product_id': self.producto.id})
        self.make_bid_url = lambda auction_id: reverse('make_bid', kwargs={'auction_id': auction_id})
        self.auction_detail_url = lambda auction_id: reverse('get_auction_detail', kwargs={'auction_id': auction_id})
        
        print("Setup completado.")
    def test_01_create_auction_successfully(self):
        """Verifica que un vendedor pueda crear una subasta."""
        
        # 1. Iniciar sesión como vendedor
        self.client.login(username='vendedor_test', password='password123')
        
        # 2. Datos de la subasta (duración corta para probar rápido)
        auction_data = {
            "precio_minimo": "10.00",
            "duracion_horas": 1 # La subasta termina en 1 hora
        }
        
        # 3. Llamar a la vista de creación
        response = self.client.post(self.auction_create_url, json.dumps(auction_data), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        self.assertIn("Subasta creada exitosamente", response.json()['message'])
        
        # 4. Verificar que el producto y la subasta se crearon
        self.producto.refresh_from_db()
        self.assertEqual(self.producto.metodo_venta, "SUBASTA")
        self.assertTrue(Auction.objects.filter(producto=self.producto).exists())
        self.auction = Auction.objects.get(producto=self.producto)
        print("Test 01: Creación de subasta OK.")


    def test_02_bid_is_validated_and_recorded(self):
        """Verifica que solo las ofertas válidas se registren."""
        
        # 1. Crear la subasta (usamos la misma lógica del test anterior)
        self.test_01_create_auction_successfully()
        auction_id = self.auction.id
        self.client.logout()
        
        # 2. Iniciar sesión como comprador
        self.client.login(username='comprador_test', password='password123')
        
        # 3. Intento de oferta inválida (menor que el mínimo de 10.00)
        invalid_bid = {"amount": "5.00"}
        response = self.client.post(self.make_bid_url(auction_id), invalid_bid, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("de al menos", response.json()['error'])
        
        # 4. Oferta inicial válida
        valid_bid_1 = {"amount": "15.00"}
        response = self.client.post(self.make_bid_url(auction_id), valid_bid_1, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Bid.objects.count(), 1)
        
        # 5. Intento de oferta posterior inválida (menor que la actual)
        invalid_bid_2 = {"amount": "14.99"}
        response = self.client.post(self.make_bid_url(auction_id), invalid_bid_2, format='json')
        self.assertEqual(response.status_code, 400)
        self.assertIn("superior a la oferta actual", response.json()['error'])
        
        # 6. Oferta posterior válida
        valid_bid_2 = {"amount": "20.00"}
        response = self.client.post(self.make_bid_url(auction_id), valid_bid_2, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Bid.objects.count(), 2)
        print("Test 02: Ofertas validadas y registradas OK.")


    def test_03_auction_finishes_and_assigns_winner(self):
        """Verifica que la subasta termine y asigne correctamente al ganador."""
        
        # 1. Crear subasta y registrar oferta
        self.test_02_bid_is_validated_and_recorded()
        auction_id = self.auction.id
        self.client.logout() # No necesitamos estar logueados para la consulta
        
        # 2. Forzar el tiempo a expirar para la prueba
        # Nota: Normalmente, no harías esto. Lo hacemos aquí para simular que pasó 1 hora.
        Auction.objects.filter(id=auction_id).update(
            end_time=timezone.now() - timedelta(minutes=5)
        )
        self.auction.refresh_from_db()
        self.assertTrue(self.auction.is_finished)
        
        # 3. Llamar a la vista de detalle (esto debería activar la lógica de finalización)
        response = self.client.get(self.auction_detail_url(auction_id))
        self.assertEqual(response.status_code, 200)
        
        # 4. Verificar el resultado de la finalización
        data = response.json()
        self.assertIn("Subasta finalizada exitosamente", data['message'])
        
        # 5. Verificar que el ganador fue asignado en la base de datos
        self.auction.refresh_from_db()
        self.assertEqual(self.auction.ganador, self.comprador)
        self.assertFalse(self.auction.is_active)
        self.assertEqual(self.auction.producto.stock, 0)
        
        print("Test 03: Subasta finalizada y ganador asignado OK.")