<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLog extends Model
{
    use HasFactory;

    public $timestamps = false; // Only uses created_at

    protected $fillable = [
        'medicine_id',
        'user_id',
        'type', // 'In', 'Out', 'Adjust'
        'qty',
        'current_stock',
        'reason',
        'reference_id',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'qty' => 'integer',
            'current_stock' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function medicine(): BelongsTo
    {
        return $this->belongsTo(Medicine::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
