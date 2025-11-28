from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.conf import settings
import json
from .models import Pedido, Producto, DetallePedido, Auction, Bid
from decimal import Decimal
from django.utils import timezone
from datetime import datetime, timedelta
from django.db.models import Max
import pytz



@csrf_exempt  
def register_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        username = data.get("username")
        email = data.get("email")
        first_name = data.get("first_name", "")
        last_name = data.get("last_name", "")
        password = data.get("password")
        
        if User.objects.filter(username=username).exists():
            return JsonResponse({"error": "Username already exists"}, status=400)
        if User.objects.filter(email=email).exists():
            return JsonResponse({"error": "Email already exists"}, status=400)
        
        user = User.objects.create_user(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password
        )
        
        user.save()

        return JsonResponse({"message": "User registered successfully"})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def login_user(request):
    if request.method == "POST":
        data = json.loads(request.body)
        identifier = data.get("identifier")
        password = data.get("password")

        user = None
        try:
            # Intenta con username
            user_obj = User.objects.get(username=identifier)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            try:
                # Intenta con email
                user_obj = User.objects.get(email=identifier)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid credentials"}, status=400)

        if user is not None:
            login(request, user)
            # Todos los usuarios son del tipo "user" (ya no hay admins)
            return JsonResponse({
                "message": "Login successful", 
                "userType": "user", 
                "username": user.username
            })
            
        return JsonResponse({"error": "Invalid credentials"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

def get_products(request):
    if request.method == "GET":
        products = Producto.objects.all().select_related('owner')
        formatted_products = []
        for p in products:
            product_data = {
                "id": p.id,
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "tipo": p.tipo,
                "precio": str(p.precio),
                "stock": p.stock,
                "condicion": p.condicion,
                "owner_username": p.owner.username,
                "metodo_venta": p.metodo_venta,
                "imagen": request.build_absolute_uri(p.imagen.url) if p.imagen else None,
                "subasta_info": None,
            }
            
            # Lógica de subasta para el listado
            if p.metodo_venta == 'SUBASTA' and p.stock > 0:
                try:
                    auction = p.subasta
                    product_data["subasta_info"] = {
                        "auction_id": auction.id,
                        "end_time": auction.end_time.astimezone(pytz.timezone("America/Bogota")).strftime("%Y-%m-%d %H:%M:%S"),
                        "precio_minimo": str(auction.precio_minimo),
                        "oferta_actual": str(auction.highest_bid.amount) if auction.highest_bid else str(auction.precio_minimo),
                        "is_active": auction.is_active,
                    }
                except Auction.DoesNotExist:
                    pass
                    
            formatted_products.append(product_data)

        return JsonResponse(formatted_products, safe=False)
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def create_product(request):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Autenticación requerida."}, status=401)
        nombre = request.POST.get("nombre")
        descripcion = request.POST.get("descripcion")
        tipo = request.POST.get("tipo")
        precio = request.POST.get("precio")
        stock = request.POST.get("stock")
        condicion = request.POST.get("condicion")
        imagen = request.FILES.get("imagen")  
        metodo_venta = request.POST.get("metodo_venta", "DIRECTA")

        producto = Producto.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            tipo=tipo,
            precio=precio,
            stock=stock,
            condicion=condicion,
            imagen=imagen,
            owner=request.user,
            metodo_venta=metodo_venta
        )

        return JsonResponse({
            "id": producto.id,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "tipo": producto.tipo,
            "precio": str(producto.precio),
            "stock": producto.stock,
            "condicion": producto.condicion,
            "imagen": request.build_absolute_uri(producto.imagen.url) if producto.imagen else None
        }, status=201)

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def edit_product(request, product_id):
    try:
        producto = Producto.objects.get(pk=product_id)
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)
    
    if request.method == "POST":
        if not request.user.is_authenticated or request.user != producto.owner:
            return JsonResponse({"error": "Acceso denegado. Solo el dueño puede editar."}, status=403)
        
        producto = Producto.objects.get(pk=product_id)
        producto.nombre = request.POST.get("nombre", producto.nombre)
        producto.descripcion = request.POST.get("descripcion", producto.descripcion)
        producto.tipo = request.POST.get("tipo", producto.tipo)
        producto.precio = request.POST.get("precio", producto.precio)
        producto.stock = request.POST.get("stock", producto.stock)
        producto.condicion = request.POST.get("condicion", producto.condicion)
        if request.FILES.get("imagen"):
            producto.imagen = request.FILES.get("imagen")

        producto.save()

        return JsonResponse({
            "id": producto.id,
            "owner": producto.owner.username,
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "tipo": producto.tipo,
            "precio": str(producto.precio),
            "stock": producto.stock,
            "condicion": producto.condicion,
            "imagen": request.build_absolute_uri(producto.imagen.url) if producto.imagen else None
        })

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def delete_product(request, product_id):
    print(request.user, request.user.is_authenticated)
    try:
        producto = Producto.objects.get(pk=product_id)
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)

    if request.method == "DELETE":
        if not request.user.is_authenticated or request.user != producto.owner:
            return JsonResponse({"error": "Acceso denegado. Solo el dueño puede eliminar."}, status=403)

        if producto.metodo_venta == 'SUBASTA' and hasattr(producto, 'subasta') and producto.subasta.is_active:
             # Si la subasta sigue activa Y no ha terminado el tiempo, no se puede borrar
             if timezone.now() < producto.subasta.end_time:
                  return JsonResponse({"error": "No se puede eliminar un producto en subasta activa."}, status=400)

        producto.delete()
        return JsonResponse({"message": "Producto eliminado exitosamente"}, status=204)

    return JsonResponse({"error": "Método no permitido."}, status=405)

@csrf_exempt
def create_auction(request, product_id):
    print(request.user, request.user.is_authenticated)
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Autenticación requerida."}, status=401)
        
        try:
            producto = Producto.objects.get(pk=product_id)
        except Producto.DoesNotExist:
            return JsonResponse({"error": "Producto no encontrado."}, status=404)

        if request.user != producto.owner:
            return JsonResponse({"error": "Solo el dueño puede crear una subasta para este producto."}, status=403)
        
        if producto.metodo_venta == 'SUBASTA':
            return JsonResponse({"error": "Este producto ya está en subasta."}, status=400)

        data = json.loads(request.body)
        precio_minimo = Decimal(data.get("precio_minimo", 0))
        duracion_horas = data.get("duracion_horas", 24)
        #duracion_horas = int(request.POST.get("duracion_horas", 24))
        local_tz = pytz.timezone("America/Bogota")
        end_time = timezone.now() + timedelta(hours=int(duracion_horas))
        
        auction = Auction.objects.create(
            producto=producto,
            #start_time=start_time,
            precio_minimo=precio_minimo,
            end_time=end_time
        )
        
        producto.metodo_venta = 'SUBASTA'
        producto.stock = 1
        producto.save()

        return JsonResponse({
            "message": "Subasta creada exitosamente",
            "auction_id": auction.id,
            "producto": producto.nombre,
            "end_time": end_time.isoformat() 
        }, status=201)

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def make_bid(request, auction_id):
    if request.method == "POST":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "Autenticación requerida."}, status=401)

        try:
            auction = Auction.objects.get(pk=auction_id, is_active=True)
        except Auction.DoesNotExist:
            return JsonResponse({"error": "Subasta no encontrada o inactiva."}, status=404)

        if auction.is_finished:
            return JsonResponse({"error": "La subasta ha finalizado."}, status=400)

        if request.user == auction.producto.owner:
            return JsonResponse({"error": "No puedes ofertar en tu propia subasta."}, status=403)

        data = json.loads(request.body)
        try:
            new_amount = Decimal(data.get("amount"))
        except:
            return JsonResponse({"error": "Monto de oferta inválido."}, status=400)

        highest = auction.highest_bid  # property
        min_bid = auction.precio_minimo

        if highest:
            min_bid = highest.amount
            if new_amount <= min_bid:
                return JsonResponse({"error": f"La oferta debe ser superior a la oferta actual de ${min_bid}."}, status=400)
        elif new_amount < min_bid:
            return JsonResponse({"error": f"La primera oferta debe ser de al menos ${min_bid}."}, status=400)

        # Crear oferta
        bid = Bid.objects.create(
            auction=auction,
            bidder=request.user,
            amount=new_amount
        )

        # actualiza ganador
        auction.ganador = request.user
        auction.save()

        # Respuesta
        return JsonResponse({
            "message": "Oferta realizada exitosamente",
            "bid_id": bid.id,
            "amount": str(bid.amount),
            "bidder": bid.bidder.username,
            "current_price": str(auction.highest_bid.amount)
        }, status=201)

    return JsonResponse({"error": "Invalid request"}, status=400)


@csrf_exempt
def cancel_auction(request, auction_id):
    if request.method != "POST":
        return JsonResponse({"error": "Method not allowed"}, status=405)
    
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
        
    try:
        auction = Auction.objects.get(pk=auction_id)
    except Auction.DoesNotExist:
        return JsonResponse({"error": "Auction not found"}, status=404)
        
    if request.user != auction.producto.owner:
        return JsonResponse({"error": "Only the owner can cancel the auction"}, status=403)
        
    if not auction.is_active:
        return JsonResponse({"error": "Auction is not active"}, status=400)
        
    # Cancelar subasta
    auction.is_active = False
    auction.save()
    
    # Restaurar producto a venta directa
    product = auction.producto
    product.metodo_venta = 'DIRECTA'
    product.save()
    
    return JsonResponse({"message": "Auction cancelled successfully"})


def serialize_auction(auction, request):
    highest_bid = auction.highest_bid

    current_price = highest_bid.amount if highest_bid else auction.precio_minimo
    bidder_username = highest_bid.bidder.username if highest_bid else None

    return {
        "auction_id": auction.id,
        "precio_minimo": str(auction.precio_minimo),
        "current_price": str(current_price),
        "highest_bidder": bidder_username,
        "end_time": auction.end_time.astimezone(pytz.timezone("America/Bogota")).strftime("%Y-%m-%d %H:%M:%S"),
        "is_active": auction.is_active,
        "is_finished": auction.is_finished,
        "ganador": auction.ganador.username if auction.ganador else None,
    }


@csrf_exempt
def get_auction_detail(request, auction_id):
    try:
        auction = Auction.objects.get(pk=auction_id)
    except Auction.DoesNotExist:
        return JsonResponse({"error": "Subasta no encontrada."}, status=404)

    # Lógica de finalización y asignación de ganador
    if not auction.is_finished and timezone.now() >= auction.end_time:
        
        highest_bid = auction.highest_bid

        if highest_bid and highest_bid.amount >= auction.precio_minimo:
            #CASO 1: HAY GANADOR
            auction.ganador = highest_bid.bidder
            auction.is_active = False 
            auction.producto.stock = 0
            auction.producto.save()
            auction.save()

            return JsonResponse({
                "message": "Subasta finalizada exitosamente.",
                "ganador": auction.ganador.username,
                "monto": str(highest_bid.amount)
            }, status=200)
            
        else:
            #CASO 2: NO HAY GANADOR 
            auction.is_active = False
            auction.save()
            auction.producto.metodo_venta = 'DIRECTA' 
            auction.producto.save()
            return JsonResponse({
                "message": "Subasta finalizada sin ofertas válidas."
            }, status=200)
    
    return JsonResponse(serialize_auction(auction, request), status=200)

@csrf_exempt
def create_order(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            username = data.get("usuario")
            usuario = User.objects.get(username=username)

            pedido = Pedido.objects.create(usuario=usuario, estado="pendiente", total=0)

            total = Decimal("0.00")

            for item in data.get("items", []):
                producto = Producto.objects.get(pk=item["producto_id"])
                cantidad = int(item["cantidad"])
                subtotal = producto.precio * cantidad

                DetallePedido.objects.create(
                    pedido=pedido,
                    producto=producto,
                    cantidad=cantidad,
                    subtotal=subtotal
                )

                producto.stock -= cantidad
                producto.save()

                total += subtotal

            pedido.total = total
            pedido.save()

            return JsonResponse({
                "id": pedido.id,
                "usuario": pedido.usuario.username,
                "estado": pedido.estado,
                "total": str(pedido.total),
                "fecha_pedido": pedido.fecha_pedido.strftime("%Y-%m-%d %H:%M:%S"),
                "detalles": [
                    {
                        "producto": detalle.producto.nombre,
                        "cantidad": detalle.cantidad,
                        "subtotal": str(detalle.subtotal)
                    }
                    for detalle in pedido.detalles.all()
                ]
            })

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def get_user_orders(request, username):
    if request.method != "GET":
        return JsonResponse({"error": "Invalid request"}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)

    pedidos = Pedido.objects.filter(usuario=user).order_by("-fecha_pedido")

    result = []
    for pedido in pedidos:
        items = []

        for detalle in pedido.detalles.all():
            items.append({
                "productName": detalle.producto.nombre,
                "quantity": detalle.cantidad,
                "price": float(detalle.producto.precio),
                "subtotal": float(detalle.subtotal)
            })

        result.append({
            "id": pedido.id,
            "date": pedido.fecha_pedido.strftime("%Y-%m-%d %H:%M:%S"),
            "total": float(pedido.total) if pedido.total is not None else 0.0,
            "status": pedido.estado,
            "items": items
        })

    return JsonResponse(result, safe=False)

def get_product_detail(request, product_id):
    if request.method != "GET":
        return JsonResponse({"error": "Método no permitido"}, status=405)
        
    try:
        producto = Producto.objects.get(pk=product_id)
    except Producto.DoesNotExist:
        return JsonResponse({"error": "Producto no encontrado"}, status=404)

    product_data = {
        "id": producto.id,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion,
        "tipo": producto.tipo,
        "precio": str(producto.precio),
        "stock": producto.stock,
        "condicion": producto.condicion,
        "owner_username": producto.owner.username,
        "metodo_venta": producto.metodo_venta,
        "imagen": request.build_absolute_uri(producto.imagen.url) if producto.imagen else None,
        "subasta_info": None,
    }

    if producto.metodo_venta == 'SUBASTA':
        try:
            auction = producto.subasta
            get_auction_detail(request, auction.id) 
            
            auction = Producto.objects.get(pk=product_id).subasta
            
            product_data["subasta_info"] = serialize_auction(auction, request)
            
            ofertas = auction.ofertas.order_by('-timestamp').select_related('bidder')
            product_data["historial_ofertas"] = [
                {
                    "bidder": o.bidder.username,
                    "amount": str(o.amount),
                    "timestamp": o.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                }
                for o in ofertas
            ]
            
        except Auction.DoesNotExist:
            pass
            
    return JsonResponse(product_data, status=200)

def get_user_products(request, username):
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "Usuario no encontrado"}, status=404)

    productos = Producto.objects.filter(owner=user)

    data = []
    for p in productos:
        subasta_data = None
        if hasattr(p, "subasta"):
            subasta = p.subasta
            subasta_data = {
                "auction_id": subasta.id,
                "precio_minimo": str(subasta.precio_minimo),
                "end_time": subasta.end_time.astimezone(pytz.timezone("America/Bogota")).strftime("%Y-%m-%d %H:%M:%S"),
                "is_active": subasta.is_active,
                "is_finished": subasta.is_finished,
                "oferta_actual": str(subasta.highest_bid.amount) if subasta.highest_bid else None,
                "ofertador_principal": subasta.highest_bid.bidder.username if subasta.highest_bid else None,
                "ganador": subasta.ganador.username if subasta.ganador else None,
            }

        data.append({
            "id": p.id,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "tipo": p.tipo,
            "precio": str(p.precio),
            "stock": p.stock,
            "condicion": p.condicion,
            "imagen": request.build_absolute_uri(p.imagen.url) if p.imagen else None,
            "owner_username": p.owner.username,
            "metodo_venta": p.metodo_venta,
            "subasta_info": subasta_data,
        })

    return JsonResponse(data, safe=False)
