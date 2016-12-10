from django.conf.urls import url
from . import views

app_name = 'workflows'
urlpatterns = [

    url(r'^$', views.index, name='index'),
    url(r'^register/$', views.register, name='register'),
    url(r'^login_user/$', views.login_user, name='login_user'),
    url(r'^logout_user/$', views.logout_user, name='logout_user'),
    url(r'^create/$', views.create, name='create'),
    url(r'^modeler/$', views.modeler, name='modeler'),
    url(r'^profileedit/$', views.profileEdit, name = 'profileedit'),
]
