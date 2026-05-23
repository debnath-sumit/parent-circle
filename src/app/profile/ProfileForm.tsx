'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function ProfileForm({
  initial
}: {
  initial: {
    name: string;
    city: string;
    address: string;
    phone: string;
    profileImage: string;
    interests: string;
  };
}) {
  const router = useRouter();
  const supabase = createClient();
  const [name, setName] = useState(initial.name);
  const [city, setCity] = useState(initial.city);
  const [address, setAddress] = useState(initial.address);
  const [phone, setPhone] = useState(initial.phone);
  const [interests, setInterests] = useState(initial.interests);
  const [profileImage, setProfileImage] = useState(initial.profileImage);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setSaved(false);
    setError(null);

    if (address.trim().length < 5) {
      setError('Full address is required.');
      setBusy(false);
      return;
    }

    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      setBusy(false);
      return;
    }

    let nextImage = profileImage;
    if (photoFile) {
      const safe = photoFile.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const path = `profiles/${user.id}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage.from('images').upload(path, photoFile);
      if (upErr) {
        setError(upErr.message);
        setBusy(false);
        return;
      }
      nextImage = supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
    }

    const tokens = interests
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        city,
        address: address.trim(),
        phone: phone.trim() || null,
        profile_image: nextImage || null,
        interests: tokens,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setProfileImage(nextImage);
    setPhotoFile(null);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-base font-semibold">About you</h2>

      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
          {profileImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xl text-slate-400">
              👤
            </div>
          )}
        </div>
        <div className="flex-1">
          <label className="label" htmlFor="profileImage">
            Profile picture <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="city">
          City
        </label>
        <input
          id="city"
          className="input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="address">
          Full address <span className="text-red-500">*</span>
        </label>
        <textarea
          id="address"
          required
          rows={2}
          className="input"
          placeholder="Street, area, city, postcode"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="phone">
          Phone number <span className="text-slate-400">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          className="input"
          placeholder="+1 555 123 4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>
      <div>
        <label className="label" htmlFor="interests">
          Interests (comma separated)
        </label>
        <input
          id="interests"
          className="input"
          placeholder="parenting, sleep, music, soccer"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
        />
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {saved ? <p className="text-sm text-green-600">Saved ✓</p> : null}
      <button type="submit" disabled={busy} className="btn-primary">
        {busy ? 'Saving…' : 'Save profile'}
      </button>
    </form>
  );
}
