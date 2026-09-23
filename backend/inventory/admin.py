from django.contrib import admin

from .models import InventoryItem


@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display = ("id", "sku", "product_name", "quantity", "reorder_level", "location", "created_at")
    search_fields = ("sku", "product_name", "location")
