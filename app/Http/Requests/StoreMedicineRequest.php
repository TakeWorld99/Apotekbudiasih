<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMedicineRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $medicineId = $this->route('medicine') ? $this->route('medicine')->id : null;

        return [
            'category_id'    => ['required', 'exists:categories,id'],
            'name'           => ['required', 'string', 'max:255'],
            'sku_code'       => ['nullable', 'string', 'max:50', Rule::unique('medicines', 'sku_code')->ignore($medicineId)],
            'bpom_number'    => ['nullable', 'string', 'max:50'],
            'type'           => ['required', 'in:Keras,Bebas Terbatas,Bebas,Jamu,Fitofarmaka,Narkotika'],
            'unit'           => ['required', 'in:Sachet,Biji,Box,Tube,Pot,Flask'],
            'price'          => ['required', 'numeric', 'min:0'],
            'purchase_price' => ['nullable', 'numeric', 'min:0'],
            'stock'          => ['required', 'integer', 'min:0'],
            'min_stock'      => ['required', 'integer', 'min:0'],
            'expiry_date'    => ['required', 'date'],
            'description'    => ['nullable', 'string'],
        ];
    }
}
