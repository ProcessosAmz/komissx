import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const stored = localStorage.getItem('komissx_user');
        if (!stored) {
            navigate('/');
            return;
        }
        try {
            setUser(JSON.parse(stored));
        } catch {
            navigate('/');
        }
    }, [navigate]);

    if (!user) return null;

    return (
        <div style={{ padding: '40px' }}>
            <h1>Painel Administrativo</h1>
            <p>Bem-vindo, <strong>{user.name}</strong></p>
            <p>Email: {user.email}</p>
            <p>Perfil: {user.role}</p>
        </div>
    );
}