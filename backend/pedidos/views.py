from django.shortcuts import render
from django.contrib.auth.models import User, Group
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.conf import settings
import json
from .models import Pedido, Producto


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

        # Asignar grupo "Cliente" por defecto
        cliente_group = Group.objects.get(name="Cliente")
        user.groups.add(cliente_group)
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
        try: #Mira si se logeo con usuario
            user_obj = User.objects.get(username=identifier)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            try: #Mira si se logeo con email
                user_obj = User.objects.get(email=identifier)
                user = authenticate(request, username=user_obj.username, password=password)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid credentials"}, status=400)

        if user is not None:
            login(request, user)  # crea sesión
                # Determinar tipo de usuario
            user_type = "admin" if user.groups.filter(name="Trabajador").exists() else "user"
            return JsonResponse({"message": "Login successful", "userType": user_type, "username": user.username})
            
        return JsonResponse({"error": "Invalid credentials"}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

def get_products(request):
    if request.method == "GET":
        products = Producto.objects.all()
        formatted_products = []
        for p in products:
            formatted_products.append({
                "id": p.id,
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "tipo": p.tipo,
                "precio": str(p.precio),
                "stock": p.stock,
                "condicion": p.condicion,
                # Construimos la URL completa de la imagen
                "imagen": request.build_absolute_uri(p.imagen.url) if p.imagen else None
            })
        return JsonResponse(formatted_products, safe=False)
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def create_product(request):
    if request.method == "POST":
        nombre = request.POST.get("nombre")
        descripcion = request.POST.get("descripcion")
        tipo = request.POST.get("tipo")
        precio = request.POST.get("precio")
        stock = request.POST.get("stock")
        condicion = request.POST.get("condicion")
        imagen = request.FILES.get("imagen")  # <-- aquí recibimos la imagen

        producto = Producto.objects.create(
            nombre=nombre,
            descripcion=descripcion,
            tipo=tipo,
            precio=precio,
            stock=stock,
            condicion=condicion,
            imagen=imagen
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
        })

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
def edit_product(request, product_id):
    if request.method == "POST":  # cambiamos a POST para recibir FormData fácilmente
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
            "nombre": producto.nombre,
            "descripcion": producto.descripcion,
            "tipo": producto.tipo,
            "precio": str(producto.precio),
            "stock": producto.stock,
            "condicion": producto.condicion,
            "imagen": request.build_absolute_uri(producto.imagen.url) if producto.imagen else None
        })

    return JsonResponse({"error": "Invalid request"}, status=400)