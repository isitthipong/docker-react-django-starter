from django.db import models


class InventoryItem(models.Model):
    sku = models.CharField(max_length=80, unique=True)
    product_name = models.CharField(max_length=200)
    quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=0)
    location = models.CharField(max_length=120, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.product_name
