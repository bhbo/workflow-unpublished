# -*- coding: utf-8 -*-
# Generated by Django 1.10.2 on 2016-12-10 20:40
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('workflows', '0003_auto_20161210_2038'),
    ]

    operations = [
        migrations.AlterField(
            model_name='workflowtemplate',
            name='creator',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='workflowtemplate',
            name='start',
            field=models.ForeignKey(default='', on_delete=django.db.models.deletion.CASCADE, to='workflows.StartEvent'),
        ),
        migrations.AlterField(
            model_name='workflowtemplate',
            name='xml',
            field=models.TextField(default=''),
        ),
    ]