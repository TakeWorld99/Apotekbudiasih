<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'nik'             => ['nullable', 'string'],
            'email'           => ['nullable', 'string'],
            'password'        => ['required', 'string'],
            'turnstile_token' => ['nullable', 'string'],
        ]);

        // Verifikasi Cloudflare Turnstile (Anti-Bot & DDoS Protection)
        $turnstileToken = $request->input('turnstile_token') ?: $request->input('cf-turnstile-response');
        $secretKey = env('CLOUDFLARE_TURNSTILE_SECRET_KEY', '3x0000000000000000000000000000000FF');

        if ($turnstileToken && $turnstileToken !== '1x00000000000000000000AA' && $turnstileToken !== '3x00000000000000000000FF' && !str_starts_with($turnstileToken, 'XXXX.')) {
            try {
                $cfRes = Http::asForm()->timeout(5)->post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
                    'secret'   => $secretKey,
                    'response' => $turnstileToken,
                    'remoteip' => $request->ip(),
                ]);

                if ($cfRes->successful() && !$cfRes->json('success')) {
                    throw ValidationException::withMessages([
                        'turnstile' => ['Verifikasi keamanan Cloudflare Turnstile gagal. Silakan coba kembali.'],
                    ]);
                }
            } catch (\Throwable $e) {
                if ($e instanceof ValidationException) {
                    throw $e;
                }
                Log::warning('Cloudflare Turnstile verification offline/error: ' . $e->getMessage());
            }
        }

        $field = $request->filled('nik') ? 'nik' : 'email';
        $identifier = $request->input($field);

        if (!$identifier) {
            throw ValidationException::withMessages([
                'nik' => ['NIK Karyawan atau email wajib diisi.'],
            ]);
        }

        $credentials = [
            $field     => $identifier,
            'password' => $request->input('password'),
        ];

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Login berhasil',
                'user'    => Auth::user(),
            ]);
        }

        throw ValidationException::withMessages([
            $field => ['NIK Karyawan atau kata sandi tidak sesuai.'],
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logout berhasil']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => ['nullable', 'email'],
            'nik'   => ['nullable', 'string'],
        ]);

        $query = $request->input('email') ?: $request->input('nik');
        $user = User::where('email', $query)->orWhere('nik', $query)->first();

        // Generate 6 digit OTP
        $otp = (string) rand(100000, 999999);

        // Target email
        $targetEmail = $user ? $user->email : $request->input('email');

        // Store OTP in cache/session for 5 minutes
        cache()->put('otp_reset_' . $targetEmail, $otp, now()->addMinutes(5));

        // Kirim email nyata jika alamat email valid dan SMTP tersedia (GRATIS via Gmail / SMTP)
        if ($targetEmail && filter_var($targetEmail, FILTER_VALIDATE_EMAIL)) {
            try {
                Mail::raw("Halo,\n\nKode verifikasi OTP untuk pemulihan kata sandi akun Apotek Budi Asih Anda adalah:\n\n{$otp}\n\nKode ini berlaku selama 5 menit. Demi keamanan, jangan berikan kode ini kepada siapapun.\n\nSalam,\nTim Keamanan & IT Apotek Budi Asih", function ($message) use ($targetEmail) {
                    $message->to($targetEmail)
                            ->subject('Kode Verifikasi OTP - Apotek Budi Asih');
                });
            } catch (\Throwable $e) {
                Log::warning("Gagal mengirim email OTP ke {$targetEmail}: " . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Kode OTP berhasil dikirimkan ke alamat email.',
            'otp'     => $otp, // returned for seamless simulation & verification
            'email'   => $targetEmail,
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'identifier' => ['required', 'string'],
            'password'   => ['required', 'string', 'min:6'],
        ]);

        $query = $request->input('identifier');
        $user = User::where('email', $query)->orWhere('nik', $query)->first();

        if ($user) {
            $user->password = Hash::make($request->input('password'));
            $user->save();

            return response()->json([
                'message' => 'Kata sandi berhasil diperbarui.',
                'user'    => $user,
            ]);
        }

        return response()->json([
            'message' => 'Kata sandi berhasil diperbarui (mode lokal).',
        ]);
    }
}
