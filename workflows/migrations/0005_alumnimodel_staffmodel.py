# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-12-10 18:53
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0008_alter_user_username_max_length'),
        ('workflows', '0004_auto_20161210_1529'),
    ]

    operations = [
        migrations.CreateModel(
            name='AlumniModel',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('profileLogo', models.FileField(default='', upload_to='')),
                ('tittle', models.CharField(default='', max_length=50)),
                ('userType', models.CharField(default='', max_length=50)),
                ('firstName', models.CharField(max_length=100)),
                ('lastName', models.CharField(max_length=100)),
                ('dateOfBirth', models.CharField(max_length=50)),
                ('department', models.CharField(default='', max_length=50)),
                ('mobile', models.CharField(max_length=50)),
                ('email', models.EmailField(max_length=50)),
                ('loopId', models.CharField(default='', max_length=50)),
                ('facebookAddress', models.CharField(max_length=100)),
            ],
        ),
        migrations.CreateModel(
            name='StaffModel',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to=settings.AUTH_USER_MODEL)),
                ('profileLogo', models.FileField(default='', upload_to='')),
                ('tittle', models.CharField(default='', max_length=50)),
                ('userType', models.CharField(default='', max_length=50)),
                ('firstName', models.CharField(max_length=100)),
                ('lastName', models.CharField(max_length=100)),
                ('dateOfBirth', models.CharField(max_length=50)),
                ('department', models.CharField(default='', max_length=50)),
                ('mobile', models.CharField(max_length=50)),
                ('email', models.EmailField(max_length=50)),
                ('loopId', models.CharField(default='', max_length=50)),
                ('facebookAddress', models.CharField(max_length=100)),
            ],
        ),
    ]
