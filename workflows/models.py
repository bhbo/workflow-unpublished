from __future__ import unicode_literals

from django.db import models
from django.contrib.auth.models import User


# Create your models here.
from django.db import models

"""
class Arc(models.Model):

    connected_node = Node()
    def action(self):
        return "do something"

class Node(models.Model):
    title = models.CharField(max_length=100)
    arc = Arc()


"""


class StudentModel(models.Model):

    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    profileLogo = models.FileField(default='')
    tittle = models.CharField(max_length=50,default='')
    userType = models.CharField(max_length=50, default='')
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    dateOfBirth = models.CharField(max_length=50)
    department = models.CharField(max_length=50, default='')
    mobile = models.CharField(max_length=50)
    email = models.EmailField(max_length=50)
    loopId = models.CharField(max_length=50,default='')
    facebookAddress = models.CharField(max_length=100)


    def __unicode__(self):
        return self.firstName


class StaffModel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    profileLogo = models.FileField(default='')
    tittle = models.CharField(max_length=50,default='')
    userType = models.CharField(max_length=50, default='')
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    dateOfBirth = models.CharField(max_length=50)
    department = models.CharField(max_length=50, default='')
    mobile = models.CharField(max_length=50)
    email = models.EmailField(max_length=50)
    loopId = models.CharField(max_length=50,default='')
    facebookAddress = models.CharField(max_length=100)


class AlumniModel(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    profileLogo = models.FileField(default='')
    tittle = models.CharField(max_length=50,default='')
    userType = models.CharField(max_length=50, default='')
    firstName = models.CharField(max_length=100)
    lastName = models.CharField(max_length=100)
    dateOfBirth = models.CharField(max_length=50)
    department = models.CharField(max_length=50, default='')
    mobile = models.CharField(max_length=50)
    email = models.EmailField(max_length=50)
    loopId = models.CharField(max_length=50,default='')
    facebookAddress = models.CharField(max_length=100)


class WorkflowTemplate(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    xml = models.TextField(default='')
    status = models.CharField(max_length=100,default="Unpublished")
    #start = models.ForeignKey(StartEvent)
    creator = models.ForeignKey(User,default=1)

