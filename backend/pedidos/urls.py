# pedidos/urls.py

from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    # AUTH
    path("register/", views.register_user),
    path("login/", views.login_user),

    # PRODUCTOS Y CRUD
    path("products/", views.get_products),
    path("products/create/", views.create_product),
    path("products/edit/<int:product_id>/", views.edit_product),
    path("products/delete/<int:product_id>/", views.delete_product),

    # PRIMERO LA ESPECÍFICA
    path("products/user/<str:username>/", views.get_user_products),

    # DESPUÉS LA GENÉRICA
    path("products/<int:product_id>/", views.get_product_detail),

    # ÓRDENES
    path("orders/create/", views.create_order),
    path("orders/user/<str:username>/", views.get_user_orders),

    # SUBASTAS
    path("auction/create/<int:product_id>/", views.create_auction),
    path("auction/<int:auction_id>/bid/", views.make_bid),
    path("auction/<int:auction_id>/cancel/", views.cancel_auction),
    path("auction/<int:auction_id>/", views.get_auction_detail),
]
