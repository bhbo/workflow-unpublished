from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.http import JsonResponse
from django.shortcuts import render, redirect, get_object_or_404
from django.db.models import Q
from .models import *

from .forms import *


def view_profile(request):
    return render(request, "workflows/view_profile.html")


def profileEdit(request):
    return render(request, 'workflows/profile-edit.html')

def create(request):
    return render(request, "workflows/create.html")


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

    print("helooooooo")
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


#User edit profile
def register_user(request):
    if not request.user.is_authenticated():
        return redirect('/register')
    else:
        form = StudentForm(request.POST or None, request.FILES or None)
        context = {
            "form": form,
        }
        if form.is_valid():
            student = form.save(commit=False)

            student.user = request.user
            student.profileLogo = request.FILES['profileLogo']

            student.save()
            return render(request, 'workflows/index.html', context)

        return render(request, 'workflows/profile-edit.html', context)


def profileDetail(request):
    if not request.user.is_authenticated():
        return render(request, 'workflows/login.html')
    else:

        user = request.user


        print("helllooo")

        return render(request, 'workflows/view_Profile.html')
'''

def profileDetail(request, user):
    if not request.user.is_authenticated():
        return render(request, 'workflows/login.html')
    else:
        user = request.user
        album = get_object_or_404(StudentModel, pk=user)
        return render(request, 'workflows/view_Profile.html', {'user': user})



def profileDetail(request):
  if request.method == 'GET':
    form = StudentForm(request.GET)
    if form.is_valid():
        return render(request, 'workflows/view_Profile.html')
  else:
    form = StudentForm()



def post_create(request):
    form =  StudentModel(request.POST or None)
    if form.is_valid():
        instance = form.save(commit=False)
        print (form.cleaned_data.get("firstname"))
        instance.save()

        context = {
            "form":  form,
        }

        return render(request,"post_form.html",context)
'''