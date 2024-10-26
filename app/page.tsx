'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Button,
    TextField,
    Box,
    Stack,
    AppBar,
    Alert,
    Divider,
} from '@mui/material';

export default function Home() {
    const { data: session, status } = useSession();
    const [clockId, setClockId] = useState('');
    const [displayValue, setDisplayValue] = useState('');
    const [currentDisplayValue, setCurrentDisplayValue] = useState('');
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'error'>('success');
    const [isClockRegistered, setIsClockRegistered] = useState(false);

    // Check if user has a registered clock on load
    useEffect(() => {
        if (session?.user?.email) {
            fetchUserClock();
        }
    }, [session]);

    const fetchUserClock = async () => {
        try {
            const response = await fetch('/api/get-user-clock');
            const data = await response.json();
            if (data.clockId) {
                setClockId(data.clockId);
                setCurrentDisplayValue(data.displayValue);
                setIsClockRegistered(true);
            }
        } catch (error) {
            console.error('Failed to fetch user clock:', error);
        }
    };

    const handleMessage = (text: string, isError: boolean = false) => {
        setMessage(text);
        setSeverity(isError ? 'error' : 'success');
        // Clear success messages after 3 seconds
        if (!isError) {
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const registerClock = async () => {
        if (!clockId) {
            handleMessage('Please enter a Clock ID', true);
            return;
        }

        try {
            const response = await fetch('/api/register-clock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clockId }),
            });

            const data = await response.json();
            if (response.ok) {
                handleMessage('Clock registered successfully!');
                setIsClockRegistered(true);
            } else {
                handleMessage(data.error || 'Failed to register clock', true);
            }
        } catch (error) {
            handleMessage('Failed to register clock', true);
        }
    };

    const updateDisplay = async () => {
        if (!displayValue) {
            handleMessage('Please enter a display value', true);
            return;
        }

        try {
            const response = await fetch('/api/update-display', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clockId, displayValue }),
            });

            const data = await response.json();
            if (response.ok) {
                handleMessage('Display value updated successfully!');
                setCurrentDisplayValue(displayValue); // Update the current display value
                setDisplayValue(''); // Clear the input field
            } else {
                handleMessage(data.error || 'Failed to update display', true);
            }
        } catch (error) {
            handleMessage('Failed to update display', true);
        }
    };

    if (status === 'loading') {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    if (!session) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Paper elevation={3} sx={{ p: 4, maxWidth: 400, width: '100%', m: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom align="center">
                        Clock Manager
                    </Typography>
                    <Typography variant="body1" gutterBottom align="center" sx={{ mb: 3 }}>
                        Please sign in to manage your clock
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={() => signIn('google')}
                        size="large"
                    >
                        Sign in with Google
                    </Button>
                </Paper>
            </Box>
        );
    }

    return (
        <>
            <AppBar position="static">
                {/* ... AppBar content remains the same ... */}
            </AppBar>

            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                    <Stack spacing={3}>
                        {/* Clock Registration Section */}
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                Clock Registration
                            </Typography>
                            <Stack spacing={2}>
                                <TextField
                                    fullWidth
                                    label="Clock ID"
                                    variant="outlined"
                                    value={clockId}
                                    onChange={(e) => !isClockRegistered && setClockId(e.target.value)}
                                    disabled={isClockRegistered}
                                    helperText={isClockRegistered ? "Clock registered" : "Enter your clock ID"}
                                />
                                {!isClockRegistered && (
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        onClick={registerClock}
                                    >
                                        Register Clock
                                    </Button>
                                )}
                            </Stack>
                        </Box>

                        {/* Display Update Section - Only shown after registration */}
                        {isClockRegistered && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography variant="h6" gutterBottom>
                                        Display Management
                                    </Typography>

                                    {/* Current Display Value */}
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 2,
                                            mb: 2,
                                            bgcolor: 'background.default',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Current Display
                                        </Typography>
                                        <Typography variant="h3" component="div" sx={{ fontFamily: 'monospace' }}>
                                            {currentDisplayValue || '0'}
                                        </Typography>
                                    </Paper>

                                    {/* Update Display Section */}
                                    <Stack spacing={2}>
                                        <TextField
                                            fullWidth
                                            label="New Display Value"
                                            variant="outlined"
                                            value={displayValue}
                                            onChange={(e) => setDisplayValue(e.target.value)}
                                            placeholder="Enter value to display"
                                        />
                                        <Button
                                            fullWidth
                                            variant="contained"
                                            color="primary"
                                            onClick={updateDisplay}
                                        >
                                            Update Display
                                        </Button>
                                    </Stack>
                                </Box>
                            </>
                        )}
                    </Stack>
                </Paper>

                {message && (
                    <Alert
                        severity={severity}
                        onClose={() => setMessage('')}
                        sx={{ mt: 2 }}
                    >
                        {message}
                    </Alert>
                )}
            </Container>
        </>
    );
}