<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_bn',
        'category_en',
        'category_bn',
        'brand_en',
        'brand_bn',
        'price',
        'price_bn',
        'description_en',
        'description_bn',
    ];
}
