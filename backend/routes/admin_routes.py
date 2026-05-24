"""
Nexus AI — Admin / Organizer Routes
File: routes/admin_routes.py
"""

from fastapi import APIRouter, Depends
from middleware.auth_middleware import verify_clerk_token
from controllers.admin_controller import (
    register_admin,
    get_current_admin,
    update_admin,
    get_college_organizers,
    modify_admin_permissions
)

router = APIRouter()

router.post(
    "/",
)(register_admin)

router.get(
    "/me",
    dependencies=[Depends(verify_clerk_token)]
)(get_current_admin)

router.patch(
    "/me",
    dependencies=[Depends(verify_clerk_token)]
)(update_admin)

router.get(
    "/organizers",
    dependencies=[Depends(verify_clerk_token)]
)(get_college_organizers)

router.post(
    "/permissions/{admin_id}",
    dependencies=[Depends(verify_clerk_token)]
)(modify_admin_permissions)
