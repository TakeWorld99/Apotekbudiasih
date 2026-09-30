<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambah is_active ke medicines untuk Soft Delete regulasi farmasi
        Schema::table('medicines', function (Blueprint $table) {
            if (!Schema::hasColumn('medicines', 'is_active')) {
                $table->boolean('is_active')->default(true)->after('description');
                $table->index('is_active');
            }
        });

        // 2. Tambah tanggal kedaluwarsa izin apoteker (SIPA/STRTTK) ke users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'sipa_expiry')) {
                $table->date('sipa_expiry')->nullable()->after('sipa');
            }
            if (!Schema::hasColumn('users', 'strttk_expiry')) {
                $table->date('strttk_expiry')->nullable()->after('strttk');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            if (Schema::hasColumn('medicines', 'is_active')) {
                $table->dropColumn('is_active');
            }
        });

        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'sipa_expiry')) {
                $table->dropColumn('sipa_expiry');
            }
            if (Schema::hasColumn('users', 'strttk_expiry')) {
                $table->dropColumn('strttk_expiry');
            }
        });
    }
};
