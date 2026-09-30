<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Entry point untuk SPA Vue 3 / Inertia application
|
*/

Route::get('/{any?}', function () {
    return view('app');
})->where('any', '.*');
