# pedidos/urls.py

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # AUTH
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    
    # PRODUCTOS Y CRUD
    path("products/", views.get_products, name="get_products"),
    path('products/create/', views.create_product, name='create_product'),
    path('products/edit/<int:product_id>/', views.edit_product, name='edit_product'),
    path('products/delete/<int:product_id>/', views.delete_product, name='delete_product'), 
    path('products/<int:product_id>/', views.get_product_detail, name='get_product_detail'), 
    
    # ÓRDENES DE VENTA DIRECTA
    path('orders/create/', views.create_order, name='create_order'),
    path('orders/user/<str:username>/', views.get_user_orders, name='get_own_user_orders'),
    
    # SUBASTAS 
    path('auction/create/<int:product_id>/', views.create_auction, name='create_auction'),
    path('auction/<int:auction_id>/bid/', views.make_bid, name='make_bid'),
    path('auction/<int:auction_id>/', views.get_auction_detail, name='get_auction_detail'),
]