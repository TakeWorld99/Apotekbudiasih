<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OpnameReport extends Model
{
    use HasFactory;

    protected $table = 'opname_reports';

    protected $guarded = ['id'];

    protected $casts = [
        'week_number' => 'integer',
        'schedule_id' => 'integer',
        'total_items_counted' => 'integer',
        'matched_items_count' => 'integer',
        'discrepancy_items_count' => 'integer',
        'total_variance_value' => 'float',
        'items' => 'array',
    ];
}
