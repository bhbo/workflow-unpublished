from django.contrib.auth.models import User
from django import forms
from workflows.models import *


class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

'''
class StudentForm(forms.ModelForm):
    class Meta:
        model = WorkflowForm

        fields = ['profileLogo',
                  'userType',
                  'tittle',
                  'firstName',
                  'lastName',
                  'dateOfBirth',
                  'department',
                  'mobile',
                  'email',
                  'loopId',
                  'facebookAddress',
                  ]

'''
class WorkflowTemplateForm(forms.ModelForm):
    class Meta:
        model = WorkflowTemplate

        fields = ['name',
                  'description'

                ]