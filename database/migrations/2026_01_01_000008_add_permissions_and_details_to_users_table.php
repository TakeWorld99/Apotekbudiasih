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
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'title')) {
                $table->string('title')->nullable()->after('role');
            }
            if (!Schema::hasColumn('users', 'status')) {
                $table->string('status', 50)->default('Aktif')->after('title');
            }
            if (!Schema::hasColumn('users', 'sipa')) {
                $table->string('sipa')->nullable()->after('status');
            }
            if (!Schema::hasColumn('users', 'strttk')) {
                $table->string('strttk')->nullable()->after('sipa');
            }
            if (!Schema::hasColumn('users', 'permissions')) {
                $table->json('permissions')->nullable()->after('strttk');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['title', 'status', 'sipa', 'strttk', 'permissions']);
        });
    }
};
