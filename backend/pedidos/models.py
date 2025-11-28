from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class Producto(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    tipo = models.CharField(max_length=50, default="General") 
    precio = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    stock = models.IntegerField(default=1)
    condicion = models.CharField(max_length=50, default="Nuevo")
    imagen = models.ImageField(upload_to='productos/', blank=True, null=True)
    # ---------------------------

    owner = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='productos_en_venta',
    )
    
    TIPO_VENTA_CHOICES = [
        ('DIRECTA', 'Venta Directa'),
        ('SUBASTA', 'Subasta'),
    ]
    metodo_venta = models.CharField(
        max_length=10,
        choices=TIPO_VENTA_CHOICES,
        default='DIRECTA'
    )

    def __str__(self):
        return self.nombre

class Pedido(models.Model):
    usuario = models.ForeignKey(User, on_delete=models.CASCADE)
    fecha_pedido = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=50)  # Ejemplo: "pendiente", "enviado", "entregado"
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0) # 

    def __str__(self):
        return f"Pedido {self.id} - {self.usuario.username}"

class DetallePedido(models.Model):
    pedido = models.ForeignKey(Pedido, on_delete=models.CASCADE, related_name="detalles")
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    cantidad = models.IntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.cantidad} x {self.producto.nombre} (Pedido {self.pedido.id})"

class Auction(models.Model):
    producto = models.OneToOneField(
        Producto, 
        on_delete=models.CASCADE, 
        related_name='subasta'
    )

    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField()
    precio_minimo = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    # Campo para registrar al ganador una vez finalizada
    ganador = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='subastas_ganadas'
    )

    def __str__(self):
        return f"Subasta por {self.producto.nombre}"
    
    @property
    def is_finished(self):
        return timezone.now() >= self.end_time or not self.is_active

    @property
    def highest_bid(self):
        # Devuelve la oferta más alta o None
        return self.ofertas.order_by('-amount').first()
    
class Bid(models.Model):
    auction = models.ForeignKey(
        Auction, 
        on_delete=models.CASCADE, 
        related_name='ofertas'
    )
    bidder = models.ForeignKey(
        User, 
        on_delete=models.CASCADE,
        related_name='ofertas_realizadas'
    )
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-amount', '-timestamp']
        
    def __str__(self):
        return f"{self.bidder.username} ofrece ${self.amount} en {self.auction.producto.nombre}"