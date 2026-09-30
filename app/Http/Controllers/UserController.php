<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    /**
     * Get all users.
     */
    public function index()
    {
        $users = User::orderBy('id', 'asc')->get();
        return response()->json($users);
    }

    /**
     * Create new user.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'nullable|string',
            'password' => 'nullable|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $roleMap = [
            'admin' => 'Admin',
            'apoteker' => 'Apoteker',
            'apoteker / kasir' => 'Apoteker',
            'kasir' => 'Kasir',
            'owner' => 'Owner',
        ];
        $rawRole = strtolower($request->role ?? 'Kasir');
        $role = $roleMap[$rawRole] ?? (str_contains($rawRole, 'apotek') ? 'Apoteker' : (str_contains($rawRole, 'admin') ? 'Admin' : 'Kasir'));

        $user = User::create([
            'nik' => $request->nik ?: '20260' . rand(1000, 9999),
            'name' => $request->name,
            'email' => strtolower($request->email),
            'role' => $role,
            'title' => $request->title ?: null,
            'status' => $request->status ?: 'Aktif',
            'sipa' => $request->sipa ?: null,
            'strttk' => $request->strttk ?: null,
            'permissions' => is_array($request->permissions) ? $request->permissions : ($role === 'Admin' ? ['all'] : ['pos']),
            'phone' => $request->phone ?: '081234567890',
            'password' => Hash::make($request->password ?: 'password123'),
            'avatar' => $request->avatar ?: null,
        ]);

        return response()->json(['success' => true, 'user' => $user]);
    }

    /**
     * Update user details.
     */
    public function update(Request $request, $id = null)
    {
        $targetId = $id ?? $request->id;
        $user = User::find($targetId);

        if (!$user) {
            return response()->json(['error' => 'Pengguna tidak ditemukan'], 404);
        }

        $data = [];
        if ($request->has('name')) $data['name'] = $request->name;
        if ($request->has('nik')) $data['nik'] = $request->nik;
        if ($request->has('email')) $data['email'] = strtolower($request->email);
        if ($request->has('role')) {
            $roleMap = [
                'admin' => 'Admin',
                'apoteker' => 'Apoteker',
                'apoteker / kasir' => 'Apoteker',
                'kasir' => 'Kasir',
                'owner' => 'Owner',
            ];
            $rawRole = strtolower($request->role);
            $data['role'] = $roleMap[$rawRole] ?? (str_contains($rawRole, 'apotek') ? 'Apoteker' : (str_contains($rawRole, 'admin') ? 'Admin' : 'Kasir'));
        }
        if ($request->has('title')) $data['title'] = $request->title;
        if ($request->has('status')) $data['status'] = $request->status;
        if ($request->has('sipa')) $data['sipa'] = $request->sipa;
        if ($request->has('strttk')) $data['strttk'] = $request->strttk;
        if ($request->has('permissions')) {
            $data['permissions'] = is_array($request->permissions) ? $request->permissions : json_decode($request->permissions, true);
        }
        if ($request->has('phone')) $data['phone'] = $request->phone;
        if ($request->has('avatar')) $data['avatar'] = $request->avatar;
        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json(['success' => true, 'user' => $user->fresh()]);
    }

    /**
     * Delete user.
     */
    public function destroy($id = null, Request $request = null)
    {
        $targetId = $id ?? ($request ? $request->id : null);
        if (!$targetId) {
            return response()->json(['error' => 'ID tidak valid'], 400);
        }

        if ((int)$targetId === 1) {
            return response()->json(['error' => 'Akun Administrator utama tidak dapat dihapus.'], 403);
        }

        $user = User::find($targetId);
        if ($user) {
            $user->delete();
        }

        return response()->json(['success' => true, 'message' => 'Pengguna berhasil dihapus.']);
    }
}
