<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Obat Keras', 'slug' => 'obat-keras', 'description' => 'Obat berlogo lingkaran merah dengan huruf K, wajib dengan resep dokter atau pengawasan apoteker.'],
            ['name' => 'Obat Bebas Terbatas', 'slug' => 'obat-bebas-terbatas', 'description' => 'Obat berlogo lingkaran biru dengan tanda peringatan khusus P1-P6.'],
            ['name' => 'Obat Bebas', 'slug' => 'obat-bebas', 'description' => 'Obat berlogo lingkaran hijau yang dapat dibeli bebas tanpa resep dokter.'],
            ['name' => 'Obat Jamu', 'slug' => 'obat-jamu', 'description' => 'Obat tradisional empiris berbasis tanaman obat berlogo ranting daun hijau (BPOM TR).'],
            ['name' => 'Obat Fitofarmaka', 'slug' => 'obat-fitofarmaka', 'description' => 'Obat herbal berstandar ilmiah yang telah lolos uji klinis pada manusia berlogo kristal salju (BPOM FF).'],
        ];

        foreach ($categories as $cat) {
            Category::updateOrCreate(['slug' => $cat['slug']], $cat);
        }
    }
}
