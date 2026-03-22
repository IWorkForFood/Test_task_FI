from django.urls import path, include

urlpatterns = [
    path("auth/", include(("core.api.v1.auth.urls", "auth"))),
    path("dds/", include(("core.api.v1.DDS.urls", "dds"))),
]
