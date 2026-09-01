from django.db import models



class Cluster(models.Model):
    name = models.CharField(max_length=100, unique=True)
    address= models.CharField(max_length=100)
    token= models.CharField(max_length=2048)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

# Create your models here.
