from __future__ import unicode_literals

from django.db import models

# Create your models here.
from django.contrib.auth.models import User
from django.db import models


'''

class State(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    executingWorkflowID = models.ForeignKey('ExecutingWorkflow')
    nextFlowObject = models.ForeignKey('self')
    def run(self):
        return self.nextActivity.connectedNode.name

class Event(State):
    def notify(self,user,message):

        return user,": get notified,",message

class Activity (State):
    action = models.TextField()
    activityHolder = models.ForeignKey('User', default=1)

class Gateway(State):

    incoming =


class ExecutingWorkflow(models.Model):
    id = models.AutoField(primary_key=True)
    form = models.ForeignKey('WorkflowForm')
    start = models.ForeignKey('Event')
    executor = models.ForeignKey('User', default=1)
    creator = models.ForeignKey('User', default=1)


    class Meta:
        db_table = "WorkflowInstance"

class WorkflowForm(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    xml = models.TextField()
    status = models.BooleanField()
    start = models.ForeignKey('Event')

    class Meta:
        db_table = "Workflow"

'''


class FlowObject(models.Model):

    id = models.CharField(max_length=100,primary_key=True)
    name = models.CharField(max_length=100 ,default="")
    status = models.BooleanField()
    def run(self):
        return self.name

class Event(FlowObject):
    def notify(self,message):
        return "notifying,",message

class StartEvent(Event):
    def notify(self):
        return "start event"

class EndEvent(Event):
    def notify(self):
        return "end event"
class Gateway (FlowObject):
    def notify(self):
        return "gateway"

class SequenceFlow(models.Model):
    id = models.CharField(max_length=100,primary_key=True)
    name = models.CharField(max_length=100, default=None)
    source = models.ForeignKey(FlowObject,related_name='source_ref')
    target = models.ForeignKey(FlowObject,related_name='terget_ref')




class WorkflowTemplate(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    xml = models.TextField(default='')
    status = models.CharField(max_length=100,default="Unpublished")
    start = models.ForeignKey(StartEvent,default=StartEvent.DEFAULT_PK)
    creator = models.ManyToManyField(User)

class ExecutingWorkflow(models.Model):
    id = models.AutoField(primary_key=True)
    template = models.ForeignKey(WorkflowTemplate, on_delete=models.CASCADE)
    start = models.ForeignKey(Event)
    executor = models.ForeignKey(User)







