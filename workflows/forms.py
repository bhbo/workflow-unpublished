from django.contrib.auth.models import User
from django import forms

from .models import *


class UserForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']


class StudentForm(forms.ModelForm):
    class Meta:
        model = StudentModel

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

    def __init__(self, *args, **kwargs):
        super(StudentForm, self).__init__(*args, **kwargs)
        self.fields['loopId'].required = False
        self.fields['profileLogo'].required = False


class WorkflowTemplateForm(forms.ModelForm):
    class Meta:
        model = WorkflowTemplate

        fields = ['name',
                  'description',

                ]



