from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

urlpatterns = [
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("products/", views.get_products, name="get_products"),
    path('products/create/', views.create_product, name='create_product'),
    path('products/edit/<int:product_id>/', views.edit_product, name='edit_product'),
    path('orders/create/', views.create_order, name='create_order'),
    path('orders/user/<str:username>/', views.get_user_orders, name='get_own_user_orders'),
]
