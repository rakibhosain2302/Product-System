<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index()
    {
        return response()->json(Product::orderByDesc('id')->paginate(10));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name_en' => ['required', 'string', 'max:255'],
            'name_bn' => ['nullable', 'string', 'max:255'],
            'category_en' => ['nullable', 'string', 'max:255'],
            'category_bn' => ['nullable', 'string', 'max:255'],
            'brand_en' => ['nullable', 'string', 'max:255'],
            'brand_bn' => ['nullable', 'string', 'max:255'],
            'price' => ['required', 'numeric', 'min:0'],
            'price_bn' => ['nullable', 'string', 'max:255'],
            'description_en' => ['nullable', 'string'],
            'description_bn' => ['nullable', 'string'],
        ]);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name_en' => ['sometimes', 'required', 'string', 'max:255'],
            'name_bn' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category_bn' => ['sometimes', 'nullable', 'string', 'max:255'],
            'brand_en' => ['sometimes', 'nullable', 'string', 'max:255'],
            'brand_bn' => ['sometimes', 'nullable', 'string', 'max:255'],
            'price' => ['sometimes', 'required', 'numeric', 'min:0'],
            'price_bn' => ['sometimes', 'nullable', 'string', 'max:255'],
            'description_en' => ['sometimes', 'nullable', 'string'],
            'description_bn' => ['sometimes', 'nullable', 'string'],
        ]);

        $product->update($validated);

        return response()->json($product);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->noContent();
    }
}
