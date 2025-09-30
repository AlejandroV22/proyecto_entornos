from django.contrib import admin

from .models import Producto, Pedido, DetallePedido

admin.site.register(Producto)
admin.site.register(Pedido)
admin.site.register(DetallePedido)
