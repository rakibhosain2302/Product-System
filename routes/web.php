<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

Route::get('/', function () {
    return view('welcome');
});

Route::post('/translate', function (Request $request) {
    $text = $request->input('q', '');

    if (trim($text) === '') {
        return response()->json(['translatedText' => '']);
    }

    try {
        $response = Http::get('https://translate.googleapis.com/translate_a/single', [
            'client' => 'gtx',
            'sl' => 'en',
            'tl' => 'bn',
            'dt' => 't',
            'q' => $text,
        ]);

        if (! $response->ok()) {
            return response()->json(['translatedText' => ''], 500);
        }

        $data = $response->json();

        $translated = '';
        if (is_array($data) && isset($data[0]) && is_array($data[0])) {
            foreach ($data[0] as $part) {
                if (isset($part[0])) {
                    $translated .= $part[0];
                }
            }
        }

        return response()->json(['translatedText' => $translated]);
    } catch (\Throwable $e) {
        return response()->json(['translatedText' => ''], 500);
    }
});
