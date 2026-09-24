from django.contrib import admin
from django.views.decorators.csrf import ensure_csrf_cookie
from django.urls import include, path
from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health),
    path("api/csrf/", csrf_token),
    path("api/products/", include("products.urls")),
    path("api/customers/", include("customers.urls")),
    path("api/orders/", include("orders.urls")),
    path("api/inventory/", include("inventory.urls")),
]
