<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Medicine extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'name',
        'sku_code',
        'bpom_number',
        'type', // 'Obat Keras', 'Obat Bebas Terbatas', 'Obat Bebas', 'Obat Jamu', 'Obat Fitofarmaka'
        'unit', // 'Sachet', 'Biji', 'Box', 'Tube', 'Pot', 'Flask'
        'price',
        'purchase_price',
        'stock',
        'min_stock',
        'expiry_date',
        'description',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'purchase_price' => 'decimal:2',
            'stock' => 'integer',
            'min_stock' => 'integer',
            'expiry_date' => 'date',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactionDetails(): HasMany
    {
        return $this->hasMany(TransactionDetail::class);
    }

    public function stockLogs(): HasMany
    {
        return $this->hasMany(StockLog::class);
    }

    public function isLowStock(): bool
    {
        return $this->stock <= $this->min_stock;
    }

    public function isExpired(): bool
    {
        return Carbon::parse($this->expiry_date)->isPast();
    }

    public function isNearExpiry(int $days = 90): bool
    {
        $expiry = Carbon::parse($this->expiry_date);
        return $expiry->isFuture() && $expiry->diffInDays(Carbon::now()) <= $days;
    }
}
