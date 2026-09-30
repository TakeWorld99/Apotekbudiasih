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
        Schema::create('medicines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->onDelete('cascade');
            $table->string('name');
            $table->string('sku_code')->unique();
            $table->string('bpom_number')->nullable();
            $table->enum('type', ['Bebas', 'Bebas Terbatas', 'Keras', 'Narkotika'])->default('Bebas');
            $table->enum('unit', ['Sachet', 'Biji', 'Box', 'Tube', 'Pot', 'Flask'])->default('Biji');
            $table->decimal('price', 12, 2);
            $table->decimal('purchase_price', 12, 2)->default(0);
            $table->integer('stock')->default(0);
            $table->integer('min_stock')->default(10);
            $table->date('expiry_date');
            $table->text('description')->nullable();
            $table->string('image')->nullable();
            $table->timestamps();

            // Indexes for fast search & filtering
            $table->index(['category_id', 'type']);
            $table->index('expiry_date');
            $table->index('stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('medicines');
    }
};
