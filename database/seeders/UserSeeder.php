<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'nik'      => '2026010188',
                'name'     => 'Afin Riyandika',
                'email'    => 'skibidibisnis@gmail.com',
                'password' => Hash::make('password123'),
                'role'     => 'Admin',
                'phone'    => '081234567890',
            ],
            [
                'nik'      => '2026011542',
                'name'     => 'Apt. Sarah Maulida, S.Farm',
                'email'    => 'apoteker@apotekbudiasih.com',
                'password' => Hash::make('password123'),
                'role'     => 'Apoteker',
                'phone'    => '081298765432',
            ],
            [
                'nik'      => '2026020119',
                'name'     => 'Budi Santoso',
                'email'    => 'kasir@apotekbudiasih.com',
                'password' => Hash::make('password123'),
                'role'     => 'Kasir',
                'phone'    => '085712345678',
            ],
        ];

        foreach ($users as $user) {
            User::updateOrCreate(['email' => $user['email']], $user);
        }
    }
}
