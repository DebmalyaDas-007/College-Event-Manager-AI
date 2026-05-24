"""
Nexus AI — Admin / Organizer Controller
File: controllers/admin_controller.py
"""

from fastapi import Request, HTTPException, status
from models.admin_model import (
    AdminCreate,
    AdminUpdate,
    AdminResponse,
    AdminPermission,
    AdminRole
)

from services.admin_service import (
    create_admin,
    get_admin_by_clerk_id,
    get_admin_by_id,
    update_admin_profile,
    list_organizers_by_college,
    update_admin_permissions
)
from controllers.auth_controller import get_clerk_id_from_request

async def register_admin(admin_data: AdminCreate) -> AdminResponse:
    """
    POST /api/v1/admin
    Registers a new admin/organizer profile.
    """
    try:
        admin_dict = create_admin(admin_data)
        return AdminResponse(**admin_dict)
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err)
        )


async def get_current_admin(request: Request) -> AdminResponse:
    """
    GET /api/v1/admin/me
    Fetches the authenticated admin/organizer's profile.
    """
    clerk_id = get_clerk_id_from_request(request)
    admin_dict = get_admin_by_clerk_id(clerk_id)
    if not admin_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin profile not registered in the system"
        )
    return AdminResponse(**admin_dict)


async def update_admin(request: Request, admin_data: AdminUpdate) -> AdminResponse:
    """
    PATCH /api/v1/admin/me
    Updates profile details of the authenticated admin.
    """
    clerk_id = get_clerk_id_from_request(request)
    updated_dict = update_admin_profile(clerk_id, admin_data)
    if not updated_dict:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin profile not found"
        )
    return AdminResponse(**updated_dict)


async def get_college_organizers(request: Request, college: str) -> list[AdminResponse]:
    """
    GET /api/v1/admin/organizers
    Retrieves list of organizers in a specific college.
    """
    # Ensure current user is authenticated (either user or admin)
    get_clerk_id_from_request(request)
    organizers = list_organizers_by_college(college)
    return [AdminResponse(**org) for org in organizers]


async def modify_admin_permissions(
    admin_id: str, 
    permissions: list[AdminPermission], 
    request: Request
) -> AdminResponse:
    """
    POST /api/v1/admin/{admin_id}/permissions
    Updates an organizer's permissions (requires Platform Admin, College Admin, or Super Admin privilege).
    """
    # 1. Verify caller
    caller_clerk_id = get_clerk_id_from_request(request)
    caller = get_admin_by_clerk_id(caller_clerk_id)
    
    if not caller:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Call must be made by an administrator"
        )
        
    # Check permissions (must be college_admin, platform_admin or super_admin)
    allowed_roles = {
        AdminRole.COLLEGE_ADMIN,
        AdminRole.PLATFORM_ADMIN,
        AdminRole.SUPER_ADMIN
    }
    
    if caller.get("admin_role") not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Insufficient privileges to assign permissions"
        )
        
    # 2. Update permissions
    updated_admin = update_admin_permissions(admin_id, permissions)
    if not updated_admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Target admin profile not found"
        )
        
    return AdminResponse(**updated_admin)
