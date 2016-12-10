from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.http import JsonResponse
from django.shortcuts import render, get_object_or_404, redirect
from django.db.models import Q

from .forms import UserForm, WorkflowTemplateForm


def profileEdit(request):
    return render(request, 'workflows/profile-edit.html')

def create(request):
    form = WorkflowTemplateForm(request.POST or None)

    if form.is_valid():
        workflow = form.save(commit=False)
        workflow.save()

        return render(request, 'workflows/modeler.html')

    else:
        context = {
            "form": form,
        }
        return render(request, 'workflows/create.html', context)



def modeler(request):
    return render(request, "workflows/modeler.html")


def index(request):
    if not request.user.is_authenticated():
        return register(request)
    else:
        return render(request, 'workflows/index.html')


def logout_user(request):
    logout(request)
    form = UserForm(request.POST or None)
    context = {
        "form": form,
    }
    return render(request, 'workflows/login.html', context)


def login_user(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return render(request, 'workflows/index.html')
            else:
                return render(request, 'workflows/login.html', {'error_message': 'Your account has been disabled'})
        else:
            return render(request, 'workflows/login.html', {'error_message': 'Invalid login'})
    return render(request, 'workflows/login.html')


def register(request):
    form = UserForm(request.POST or None)

    if form.is_valid():
        user = form.save(commit=False)
        username = form.cleaned_data['username']
        password = form.cleaned_data['password']
        user.set_password(password)
        user.save()
        user = authenticate(username=username, password=password)
        if user is not None:
            if user.is_active:
                login(request, user)
                return render(request, 'workflows/index.html')
    context = {
        "form": form,
    }
    return render(request, 'workflows/register.html', context)


