import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, Save, Plus, X, Edit2, Check, Award } from 'lucide-react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { Avatar, Button, GlassCard, Input, XPBar } from '../components/ui'

const levelColors = {
  'Básico': '#778DA9',
  'Intermedio': '#9db5cc',
  'Avanzado': '#E0E1DD'
}

const LADO_MAXIMO_PX = 400
const CALIDAD_JPEG = 0.8
const TAMANO_MAXIMO_BYTES = 1.5 * 1024 * 1024

export default function Profile() {
  const navigate = useNavigate()
  const inputFileRef = useRef(null)

  const [perfil, setPerfil] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [comprimiendo, setComprimiendo] = useState(false)
  const [error, setError] = useState("")

  const [form, setForm] = useState({
    name: '',
    email: '',
    career: '',
    semester: '',
    github: '',
    linkedin: '',
    bio: '',
    foto: ''
  })

  const [skills, setSkills] = useState([])
  const [newSkill, setNewSkill] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('Básico')

  useEffect(() => {
    cargarPerfil()
  }, [])

  const cargarPerfil = async () => {
    try {
      const localData = JSON.parse(localStorage.getItem('usuario') || '{}')

      const { data } = await api.get('/usuarios/me')

      // Traemos la posición del ranking aparte, ya que /usuarios/me no la incluye.
      // Si falla (ej. el usuario aún no tiene posición asignada), simplemente no se muestra.
      let posicionGlobal = null
      try {
        const { data: posicionData } = await api.get(`/ranking/usuario/${data.id}`)
        posicionGlobal = posicionData?.posicion ?? null
      } catch (posErr) {
        posicionGlobal = null
      }

      setPerfil({ ...data, posicionGlobal })

      const perfilCompleto = {
        name: data.nombre || localData.name || '',
        email: data.email || localData.email || '',
        career: data.carrera || localData.career || '',
        semester: data.semestre ?? localData.semester ?? '',
        github: data.github || localData.github || '',
        linkedin: data.linkedin || localData.linkedin || '',
        bio: data.descripcion || localData.bio || '',
        foto: data.foto || localData.foto || ''
      }

      setForm(perfilCompleto)
      
      const habs = (data.habilidades || []).map(h => ({
        id: h.id,
        nombre: h.nombre,
        nivel: h.nivel || 'Básico'
      }))
      setSkills(habs)
    } catch (err) {
      const localData = JSON.parse(localStorage.getItem('usuario') || '{}')
      if (localData.name) {
        setForm(localData)
      } else {
        setError("No se pudo cargar el perfil desde el servidor.")
      }
    } finally {
      setCargando(false)
    }
  }

  const setField = (key) => (e) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }))

  const comprimirImagen = (archivo) =>
    new Promise((resolve, reject) => {
      const lector = new FileReader()
      lector.onload = () => {
        const img = new Image()
        img.onload = () => {
          let { width, height } = img
          if (width > height && width > LADO_MAXIMO_PX) {
            height = Math.round((height * LADO_MAXIMO_PX) / width)
            width = LADO_MAXIMO_PX
          } else if (height > LADO_MAXIMO_PX) {
            width = Math.round((width * LADO_MAXIMO_PX) / height)
            height = LADO_MAXIMO_PX
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, width, height)

          resolve(canvas.toDataURL('image/jpeg', CALIDAD_JPEG))
        }
        img.onerror = () => reject(new Error('No se pudo leer la imagen.'))
        img.src = lector.result
      }
      lector.onerror = () => reject(new Error('No se pudo leer el archivo.'))
      lector.readAsDataURL(archivo)
    })

  const handleElegirFoto = async (e) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return

    setError("")
    if (!archivo.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen.")
      return
    }

    setComprimiendo(true)
    try {
      const comprimida = await comprimirImagen(archivo)
      const bytesAproximados = Math.round((comprimida.length * 3) / 4)
      if (bytesAproximados > TAMANO_MAXIMO_BYTES) {
        setError("La imagen es demasiado pesada.")
        return
      }
      setForm(prev => ({ ...prev, foto: comprimida }))
    } catch (err) {
      setError("Error al procesar la imagen.")
    } finally {
      setComprimiendo(false)
    }
  }

  const addSkill = () => {
    if (!newSkill.trim()) return
    if (skills.some(s => s.nombre.toLowerCase() === newSkill.trim().toLowerCase())) {
      setError("Ya agregaste esta habilidad.")
      return
    }
    setError("")
    setSkills(s => [...s, { id: `temp-${Date.now()}`, nombre: newSkill.trim(), nivel: newSkillLevel }])
    setNewSkill('')
    setNewSkillLevel('Básico')
  }

  const removeSkill = (id) => setSkills(s => s.filter(sk => sk.id !== id))

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("El nombre es requerido.")
      return
    }

    setGuardando(true)
    setError("")
    try {
      // 1. Guardar perfil general
      await api.put(`/usuarios/${perfil.id}`, {
        nombre: form.name.trim(),
        carrera: form.career.trim() || null,
        semestre: form.semester !== '' ? parseInt(form.semester) : null,
        github: form.github.trim() || null,
        linkedin: form.linkedin.trim() || null,
        descripcion: form.bio.trim() || null,
        foto: form.foto || null,
      })

      // 2. Borrar las habilidades que se quitaron en la interfaz
      const habilidadesOriginales = perfil.habilidades || []
      const idsActuales = skills.map(sk => sk.id)

      for (const habOriginal of habilidadesOriginales) {
        if (!idsActuales.includes(habOriginal.id)) {
          await api.delete(`/habilidades/usuario/${perfil.id}/${habOriginal.id}`)
        }
      }

      // 3. Crear las nuevas habilidades agregadas (las que empiezan con temp-)
      for (const sk of skills) {
        if (String(sk.id).startsWith('temp-')) {
          await api.post(`/habilidades/usuario/${perfil.id}`, {
            nombre: sk.nombre,
            nivel: sk.nivel
          })
        }
      }

      // 4. Guardar de forma persistente e inmediata en LocalStorage
      localStorage.setItem('usuario', JSON.stringify(form))

      // Recargar datos frescos del servidor
      await cargarPerfil()

      setSaved(true)
      setIsEditing(false)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.response?.data?.error || "Error al guardar cambios en el servidor.")
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div>
        <Navbar />
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '90px 24px 32px' }}>
          <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
        </div>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '90px 24px 32px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 700, margin: '0 0 4px' }}>Mi Perfil</h1>
            <p style={{ color: '#778DA9', margin: 0 }}>
              {isEditing ? 'Actualiza tu información y habilidades' : 'Consulta tus datos y progreso'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {!isEditing ? (
              <>
               <Button variant="ghost" onClick={() => navigate(`/usuarios/${perfil.id}`)}>Ver perfil público</Button>
                <Button variant="primary" onClick={() => setIsEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Edit2 size={15} /> Editar perfil
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={guardando}>
                  Cancelar
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={guardando} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {saved ? <><Check size={15} /> Guardado</> : <><Save size={15} /> {guardando ? 'Guardando...' : 'Guardar cambios'}</>}
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(201, 112, 112, 0.12)', color: '#c97070', fontSize: '13px', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative' }}>
                  {form.foto ? (
                    <img
                      src={form.foto}
                      alt="Avatar"
                      style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #c49a3f' }}
                    />
                  ) : (
                    <Avatar name={form.name || 'Usuario'} size={80} ring="gold" level={perfil?.nivel || 1} />
                  )}

                  {isEditing && (
                    <>
                      <button
                        type="button"
                        onClick={() => inputFileRef.current?.click()}
                        disabled={comprimiendo}
                        style={{
                          position: 'absolute', bottom: 0, right: 0,
                          width: 28, height: 28, borderRadius: '50%',
                          background: '#415A77', border: '2px solid #0D1B2A',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Camera size={13} color="#E0E1DD" />
                      </button>
                      <input
                        ref={inputFileRef}
                        type="file"
                        accept="image/*"
                        onChange={handleElegirFoto}
                        style={{ display: 'none' }}
                      />
                    </>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600, margin: '0 0 4px', fontSize: '18px' }}>
                    {form.name || 'Sin nombre'}
                  </h3>
                  <p style={{ color: '#778DA9', margin: '0 0 8px', fontSize: '13px' }}>
                    Nivel {perfil?.nivel || 1} · {perfil?.rango || 'Principiante'}
                  </p>
                  <XPBar value={perfil?.xp || 0} max={(perfil?.nivel || 1) * 1000} showValues />
                </div>
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, margin: '0 0 20px' }}>Información personal</h2>
              
              {isEditing ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label="Nombre completo" value={form.name} onChange={setField('name')} />
                    <Input label="Correo institucional" type="email" value={form.email} disabled />
                    <Input label="Carrera" value={form.career} onChange={setField('career')} />
                    <Input label="Semestre" type="number" value={form.semester} onChange={setField('semester')} />
                    <Input label="GitHub" value={form.github} onChange={setField('github')} placeholder="@usuario" />
                    <Input label="LinkedIn" value={form.linkedin} onChange={setField('linkedin')} placeholder="URL de tu perfil" />
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500, color: '#778DA9', display: 'block', marginBottom: '6px' }}>Biografía</label>
                    <textarea
                      value={form.bio}
                      onChange={setField('bio')}
                      rows={3}
                      placeholder="Cuéntanos sobre ti…"
                      style={{
                        width: '100%', padding: '12px 14px',
                        background: 'rgba(224, 225, 221, 0.06)',
                        border: '1px solid rgba(224, 225, 221, 0.15)',
                        borderRadius: '12px', color: '#E0E1DD', fontSize: '14px',
                        outline: 'none', resize: 'vertical', fontFamily: 'var(--font-body)',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '4px' }}>Nombre completo</span>
                      <span style={{ fontSize: '14px', color: '#E0E1DD', fontWeight: 500 }}>{form.name || '—'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '4px' }}>Correo institucional</span>
                      <span style={{ fontSize: '14px', color: '#E0E1DD', fontWeight: 500 }}>{form.email || '—'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '4px' }}>Carrera</span>
                      <span style={{ fontSize: '14px', color: '#E0E1DD', fontWeight: 500 }}>{form.career || '—'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '4px' }}>Semestre</span>
                      <span style={{ fontSize: '14px', color: '#E0E1DD', fontWeight: 500 }}>{form.semester || '—'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '4px' }}>GitHub</span>
                      <span style={{ fontSize: '14px', color: '#E0E1DD', fontWeight: 500 }}>{form.github || '—'}</span>
                    </div>
                    <div>
                      <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '4px' }}>LinkedIn</span>
                      <span style={{ fontSize: '14px', color: '#E0E1DD', fontWeight: 500 }}>{form.linkedin || '—'}</span>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#778DA9', display: 'block', marginBottom: '4px' }}>Biografía</span>
                    <p style={{ fontSize: '14px', color: '#E0E1DD', margin: 0, lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                      {form.bio || 'Sin biografía añadida.'}
                    </p>
                  </div>
                </div>
              )}
            </GlassCard>

            <GlassCard style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 600, margin: 0 }}>Habilidades</h2>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    style={{ fontSize: '13px', color: '#778DA9', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit2 size={13} /> Gestionar
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: isEditing ? '16px' : '0' }}>
                {skills.length > 0 ? (
                  skills.map(sk => (
                    <div key={sk.id} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '7px 12px', borderRadius: '999px',
                      background: 'rgba(65, 90, 119, 0.2)', border: '1px solid rgba(65, 90, 119, 0.35)',
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#E0E1DD' }}>{sk.nombre}</span>
                      <span style={{ fontSize: '11px', color: levelColors[sk.nivel] || '#778DA9' }}>{sk.nivel}</span>
                      {isEditing && (
                        <button onClick={() => removeSkill(sk.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#415A77' }}>
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#778DA9', fontSize: '13px', margin: 0 }}>No se han agregado habilidades.</p>
                )}
              </div>

              {isEditing && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <input
                    value={newSkill}
                    onChange={e => setNewSkill(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addSkill()}
                    placeholder="Agregar habilidad…"
                    style={{
                      flex: 1, padding: '9px 14px', background: 'rgba(224,225,221,0.06)',
                      border: '1px solid rgba(224,225,221,0.12)', borderRadius: '999px',
                      color: '#E0E1DD', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)',
                    }}
                  />
                  <select
                    value={newSkillLevel}
                    onChange={e => setNewSkillLevel(e.target.value)}
                    style={{
                      padding: '9px 12px', background: 'rgba(13, 27, 42, 0.8)',
                      border: '1px solid rgba(224,225,221,0.12)', borderRadius: '999px',
                      color: '#E0E1DD', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)', cursor: 'pointer'
                    }}
                  >
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                  <button onClick={addSkill} style={{
                    width: 36, height: 36, borderRadius: '50%', border: 'none',
                    background: '#415A77', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Plus size={16} color="#E0E1DD" />
                  </button>
                </div>
              )}
            </GlassCard>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <GlassCard style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: '0 0 16px' }}>Estadísticas</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { label: 'XP total', value: perfil?.xp?.toLocaleString() || '0', mono: true },
                  { label: 'Nivel', value: perfil?.nivel || '1', mono: true },
                  { label: 'Misiones completadas', value: perfil?.misionesCompletadas || '0', mono: true },
                  { label: 'Posición global', value: perfil?.posicionGlobal ? `#${perfil.posicionGlobal}` : '—', mono: true },
                  { label: 'Racha actual', value: perfil?.racha ? `${perfil.racha} días` : '0 días', mono: false },
                  { label: 'Equipo', value: perfil?.equipo || 'Sin equipo', mono: false },
                ].map(({ label, value, mono }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(224,225,221,0.06)' }}>
                    <span style={{ fontSize: '13px', color: '#778DA9' }}>{label}</span>
                    <span style={{ fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)', fontSize: '14px', fontWeight: 600, color: '#E0E1DD' }}>{value}</span>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: '0 0 14px' }}>Insignias recientes</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {perfil?.insignias && perfil.insignias.length > 0 ? (
                  perfil.insignias.map((insignia) => (
                    <div key={insignia.id} title={insignia.nombre} style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: 'rgba(65, 90, 119, 0.2)', border: '1px solid rgba(65, 90, 119, 0.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Award size={20} color="#c49a3f" />
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#778DA9', fontSize: '13px', margin: 0 }}>Aún no has ganado insignias.</p>
                )}
              </div>
            </GlassCard>

            <GlassCard style={{ padding: '20px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, margin: '0 0 14px', color: '#c97070' }}>Zona de peligro</h3>
              <Button variant="danger" size="sm" style={{ width: '100%' }}>
                Eliminar cuenta
              </Button>
            </GlassCard>
          </div>

        </div>
      </div>
    </div>
  )
}