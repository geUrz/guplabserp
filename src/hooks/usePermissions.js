// hooks/usePermissions.js
import { useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function usePermissions() {
  const { user } = useAuth()

  return useMemo(() => {
    if (!user) return {}
    
    return {
      isAdmin: user.nivel === 'admin',
      isPremium: user.negocio_plan === 'premium',
      isUserSuperUser: ['usuariosu', 'usuario'].includes(user.nivel),
      isSuperUser: user.nivel === 'usuariosu',
      isUser: user.nivel === 'usuario',
      isUserActive: user.isactive === 1,
      negocioId: user.negocio_id,
      userId: user.id
    }
  }, [user])
}
