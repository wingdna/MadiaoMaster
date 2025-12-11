
import React, { useState, useEffect } from 'react';
import { fetchAllMatchLogs, deleteMatchLog, getSupabaseConfig, initSupabase, AdminLogEntry } from '../../services/cloudService';

interface AdminGateProps {
    onExit: () => void;
}

export const AdminGate: React.FC<AdminGateProps> = ({ onExit }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // Dashboard State
    const [logs, setLogs] = useState<AdminLogEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [dbUrl, setDbUrl] = useState('');
    const [dbKey, setDbKey] = useState('');
    const [configStatus, setConfigStatus] = useState('');

    useEffect(() => {
        const config = getSupabaseConfig();
        setDbUrl(config.url);
        setDbKey(config.key);
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === 'Lhy' && password === 'Lhy147258') {
            setIsAuthenticated(true);
            setErrorMsg('');
            loadData();
        } else {
            setErrorMsg("Invalid Administrator Credentials");
        }
    };

    const handleConfigSave = () => {
        if (initSupabase(dbUrl, dbKey)) {
            setConfigStatus("Connection Successful (MemFire/Supabase)");
            loadData();
        } else {
            setConfigStatus("Connection Failed");
        }
    };

    const loadData = async () => {
        setLoading(true);
        const data = await fetchAllMatchLogs();
        setLogs(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this record? This cannot be undone.")) {
            const success = await deleteMatchLog(id);
            if (success) {
                setLogs(prev => prev.filter(l => l.id !== id));
            } else {
                alert("Delete failed. Check database permissions.");
            }
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="fixed inset-0 z-[999] bg-[#050202] flex items-center justify-center font-serif text-[#c5a059]">
                <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
                <div className="w-full max-w-md p-8 border border-[#3e2b22] bg-[#15100e] rounded-sm shadow-lacquer-deep relative">
                    <button onClick={onExit} className="absolute top-4 right-4 text-[#5c4025] hover:text-[#c5a059]">✕</button>
                    <h2 className="text-3xl text-center mb-8 font-bold tracking-[0.2em] border-b border-[#2a1d15] pb-4">ADMIN PORTAL</h2>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-[#8c6239] mb-2">Admin ID</label>
                            <input 
                                type="text" 
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full bg-[#0a0806] border border-[#3e2b22] text-[#e6c278] px-4 py-3 focus:border-[#c5a059] outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-[#8c6239] mb-2">Passkey</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full bg-[#0a0806] border border-[#3e2b22] text-[#e6c278] px-4 py-3 focus:border-[#c5a059] outline-none transition-colors"
                            />
                        </div>
                        {errorMsg && <div className="text-red-500 text-xs text-center">{errorMsg}</div>}
                        <button type="submit" className="w-full py-4 bg-[#3d0e0e] border border-[#5c1010] text-[#a0a0a0] hover:text-white hover:bg-[#5c1010] transition-colors font-bold tracking-[0.2em]">
                            AUTHENTICATE
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[999] bg-[#0c0c0c] text-[#a0a0a0] font-sans flex flex-col overflow-hidden">
            {/* Header */}
            <div className="h-16 bg-[#15100e] border-b border-[#3e2b22] flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl text-[#c5a059] font-serif tracking-widest font-bold">MA DIAO ADMIN</h1>
                    <span className="text-xs bg-[#3e2b22] text-[#e6c278] px-2 py-0.5 rounded">Superuser: Lhy</span>
                </div>
                <div className="flex gap-4">
                     <button onClick={loadData} className="text-xs uppercase hover:text-white flex items-center gap-1">
                        <span>↻</span> Refresh
                    </button>
                    <button onClick={onExit} className="text-xs uppercase hover:text-white border border-[#3e2b22] px-3 py-1 rounded hover:bg-[#2a1d15]">
                        Exit to Game
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar Config */}
                <div className="w-80 bg-[#111] border-r border-[#222] p-6 flex flex-col gap-6 overflow-y-auto">
                    <div>
                        <h3 className="text-xs uppercase tracking-widest text-[#8c6239] mb-4 font-bold">Database Connection</h3>
                        <p className="text-[10px] text-gray-500 mb-4 leading-relaxed">
                            Recommended for China: <strong>MemFire Cloud</strong>. 
                            It is Supabase-compatible. Enter MemFire API URL & Key below.
                        </p>
                        <div className="space-y-3">
                            <input 
                                type="text" 
                                placeholder="API URL (e.g., https://xyz.memfiredb.com)"
                                value={dbUrl}
                                onChange={e => setDbUrl(e.target.value)}
                                className="w-full bg-black border border-[#333] px-3 py-2 text-xs rounded focus:border-[#c5a059] outline-none"
                            />
                            <input 
                                type="password" 
                                placeholder="Anon Key"
                                value={dbKey}
                                onChange={e => setDbKey(e.target.value)}
                                className="w-full bg-black border border-[#333] px-3 py-2 text-xs rounded focus:border-[#c5a059] outline-none"
                            />
                            <button onClick={handleConfigSave} className="w-full py-2 bg-[#222] hover:bg-[#333] text-xs border border-[#444] text-[#ccc]">Update Connection</button>
                            {configStatus && <div className="text-[10px] text-green-500 mt-2">{configStatus}</div>}
                        </div>
                    </div>
                    
                    <div className="mt-auto">
                        <h3 className="text-xs uppercase tracking-widest text-[#8c6239] mb-2 font-bold">Storage Stats</h3>
                        <div className="text-xs text-gray-500">
                            Logs Loaded: {logs.length}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-[#050505] p-8 overflow-y-auto">
                    <h2 className="text-2xl text-white mb-6 font-thin">Game Match Logs</h2>
                    
                    {loading ? (
                        <div className="text-center py-20 text-[#555] animate-pulse">Fetching remote data...</div>
                    ) : (
                        <div className="border border-[#222] rounded overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#1a1a1a] text-[#888]">
                                    <tr>
                                        <th className="p-4 font-normal">Timestamp</th>
                                        <th className="p-4 font-normal">Match ID</th>
                                        <th className="p-4 font-normal">Winner</th>
                                        <th className="p-4 font-normal">Rounds</th>
                                        <th className="p-4 font-normal text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#222]">
                                    {logs.map(log => {
                                        const date = new Date(log.timestamp).toLocaleString();
                                        const winner = log.data.results.find((r: any) => r.isWinner);
                                        const winnerText = winner ? `Player ${winner.playerId}` : 'Draw';
                                        
                                        return (
                                            <tr key={log.id} className="hover:bg-[#111] transition-colors">
                                                <td className="p-4 text-[#ccc]">{date}</td>
                                                <td className="p-4 font-mono text-xs text-[#666]">{log.id.substring(0, 8)}...</td>
                                                <td className="p-4 text-[#c5a059]">{winnerText}</td>
                                                <td className="p-4 text-[#888]">{log.data.results.length} Player Stats</td>
                                                <td className="p-4 text-right">
                                                    <button 
                                                        onClick={() => handleDelete(log.id)}
                                                        className="text-red-900 hover:text-red-500 text-xs px-2 py-1 border border-red-900/30 rounded hover:bg-red-900/10 transition-colors"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {logs.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-[#444] italic">
                                                No match logs found in database.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
