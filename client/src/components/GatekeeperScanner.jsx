import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  User,
  Phone,
  Film,
  MapPin,
  Sparkles,
  RefreshCw,
  Loader2,
  ShieldCheck,
  DoorOpen,
  Volume2
} from 'lucide-react';
import { apiVerifyTicket, apiCheckInTicket, apiLookupBookings } from '../services/api';
import confetti from 'canvas-confetti';

export default function GatekeeperScanner({ onBack }) {
  const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'manual'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [verifiedTicket, setVerifiedTicket] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [recentCheckedIn, setRecentCheckedIn] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState('environment'); // 'environment' | 'user'
  const [cameraError, setCameraError] = useState(null);
  const [recentLiveBookings, setRecentLiveBookings] = useState([]);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  // Play audio cues
  const playSound = (type = 'success') => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'warning') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        osc.frequency.setValueAtTime(180, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) { }
  };

  // Fetch recent confirmed bookings for fast 1-tap testing
  useEffect(() => {
    apiLookupBookings('GJ')
      .then(res => {
        if (res?.success && Array.isArray(res.data)) {
          setRecentLiveBookings(res.data.slice(0, 5));
        }
      })
      .catch(() => { });
  }, []);

  // Camera initialization
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }

      // Check native BarcodeDetector if supported
      if ('BarcodeDetector' in window) {
        const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetector.detect(videoRef.current);
            if (barcodes.length > 0) {
              const detected = barcodes[0].rawValue;
              if (detected) {
                clearInterval(scanIntervalRef.current);
                handleVerify(detected);
              }
            }
          } catch (err) { }
        }, 600);
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraError('क्यामेरा सुरु गर्न सकिएन। म्यानुअल कोड प्रविष्टि प्रयोग गर्नुहोस् (Camera unavailable on this device)');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, cameraFacing]);

  // Main verification logic
  const handleVerify = async (queryParam) => {
    const target = queryParam || searchQuery;
    if (!target || !target.trim()) return;

    setIsSearching(true);
    setVerificationError(null);
    setVerifiedTicket(null);

    try {
      const res = await apiVerifyTicket(target.trim());
      if (res?.success && res?.booking) {
        setVerifiedTicket({
          ...res.booking,
          isCheckedIn: res.isCheckedIn,
          checkedInAt: res.checkedInAt
        });

        if (res.isCheckedIn) {
          playSound('warning');
        } else {
          playSound('success');
        }
      } else {
        throw new Error(res?.message || 'टिकट फेला परेन वा अमान्य छ');
      }
    } catch (err) {
      playSound('warning');
      setVerificationError(err.message || 'टिकट प्रमाणीकरण हुन सकेन');
    } finally {
      setIsSearching(false);
    }
  };

  // Check in action
  const handleApproveEntry = async () => {
    if (!verifiedTicket?.bookingRef) return;
    setIsCheckingIn(true);

    try {
      const res = await apiCheckInTicket(verifiedTicket.bookingRef, 'गिरिजा गेट अङ्कल');

      if (res?.success) {
        playSound('success');
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) { }

        const checkInTime = res.checkedInAt || new Date().toISOString();
        setVerifiedTicket(prev => ({
          ...prev,
          isCheckedIn: true,
          checkedInAt: checkInTime
        }));

        setRecentCheckedIn(prev => [
          {
            bookingRef: verifiedTicket.bookingRef,
            movieTitle: verifiedTicket.show?.movie?.title || 'चलचित्र',
            customerName: verifiedTicket.customerName,
            seats: verifiedTicket.seats || [],
            time: new Date(checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...prev.slice(0, 9)
        ]);
      } else {
        throw new Error(res?.message || 'चेक-इन असफल');
      }
    } catch (err) {
      playSound('warning');
      alert(`त्रुटि: ${err.message}`);
    } finally {
      setIsCheckingIn(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Top Gate Header */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-950/50">
            <DoorOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">गिरिजा सिनेमा प्रवेश द्वार स्क्यानर</h2>
              <span className="text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Live Gate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Station Road, Janakpurdham • Hall 1 & 2 Ticket Validation
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'camera'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>क्यामेरा स्क्यानर</span>
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'manual'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>म्यानुअल कोड</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Scanner / Input View (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {activeTab === 'camera' ? (
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Live Viewfinder</span>
                <button
                  onClick={() => setCameraFacing(prev => prev === 'environment' ? 'user' : 'environment')}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>क्यामेरा बदल्नुहोस् ({cameraFacing === 'environment' ? 'Back' : 'Front'})</span>
                </button>
              </div>

              {/* Viewfinder Window */}
              <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Laser scan animation overlay */}
                <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8">
                  <div className="w-full border-t-2 border-emerald-400/80 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pulse" />
                  <div className="w-48 h-48 mx-auto border-2 border-dashed border-emerald-400/50 rounded-2xl flex items-center justify-center">
                    <QrCode className="w-12 h-12 text-emerald-400/30" />
                  </div>
                  <div className="text-center text-[10px] font-mono text-emerald-300 bg-black/60 py-1 px-3 rounded-full mx-auto backdrop-blur-sm">
                    टिकटको QR कोड फ्रेमभित्र राख्नुहोस्
                  </div>
                </div>

                {cameraError && (
                  <div className="absolute inset-0 bg-slate-950/90 p-6 flex flex-col items-center justify-center text-center space-y-3">
                    <AlertTriangle className="w-10 h-10 text-amber-400" />
                    <p className="text-xs text-slate-300">{cameraError}</p>
                    <button
                      onClick={() => setActiveTab('manual')}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                    >
                      म्यानुअल कोड प्रविष्टि गर्नुहोस्
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-4 h-4 text-rose-500" />
                <span>म्यानुअल टिकट नम्बर वा मोबाइल नं</span>
              </h3>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerify();
                }}
                className="space-y-3"
              >
                <div>
                  <input
                    type="text"
                    placeholder="उदा: GJ-888866 वा 9841234567"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 text-base font-mono uppercase text-slate-100 placeholder-slate-600 px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSearching || !searchQuery.trim()}
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>प्रणालीमा खोजिँदैछ...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>टिकट जाँच्नुहोस् (Verify Ticket)</span>
                    </>
                  )}
                </button>
              </form>

              {/* Quick Pick Demo Bookings */}
              {recentLiveBookings.length > 0 && (
                <div className="pt-3 border-t border-slate-800/80 space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    द्रुत परीक्षण (Recent Real Bookings):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recentLiveBookings.map(b => (
                      <button
                        key={b.id || b.bookingRef}
                        type="button"
                        onClick={() => {
                          setSearchQuery(b.bookingRef);
                          handleVerify(b.bookingRef);
                        }}
                        className="text-[10px] font-mono font-bold bg-slate-950 hover:bg-slate-800 text-rose-400 hover:text-white px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
                      >
                        #{b.bookingRef}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quick Scanner Manual Backup input always available */}
          {activeTab === 'camera' && (
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex gap-2">
              <input
                type="text"
                placeholder="वा कोड टाइप गर्नुहोस् (GJ-XXXXXX)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-950 text-xs font-mono uppercase text-slate-200 placeholder-slate-600 px-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={() => handleVerify()}
                disabled={isSearching || !searchQuery.trim()}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-colors border border-slate-700 cursor-pointer"
              >
                जाँच्नुहोस्
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Gate Decision Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Waiting for Scan State */}
          {!verifiedTicket && !verificationError && !isSearching && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[320px] space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500">
                <QrCode className="w-8 h-8" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-300">स्क्यानको प्रतीक्षा गर्दै (Awaiting Scan)</h4>
              <p className="text-xs text-slate-500 max-w-xs">
                ग्राहकको टिकट QR कोड क्यामेरा अगाडि देखाउनुहोस् वा माथिको बाकसमा ६ अङ्कको कोड टाइप गर्नुहोस्।
              </p>
            </div>
          )}

          {/* Searching Loader State */}
          {isSearching && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[320px] space-y-3">
              <Loader2 className="w-10 h-10 animate-spin text-rose-500" />
              <p className="text-xs text-slate-300 font-semibold">Supabase डेटाबेसमा टिकट प्रमाणीकरण हुँदैछ...</p>
            </div>
          )}

          {/* Error / Not Found State */}
          {verificationError && (
            <div className="bg-rose-950/20 border-2 border-rose-500/50 rounded-3xl p-6 space-y-4 animate-in shake duration-300">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-rose-400">प्रवेश अस्वीकृत (ENTRY DENIED)</h4>
                  <p className="text-xs text-rose-200 mt-0.5">{verificationError}</p>
                </div>
              </div>
              <div className="p-3 bg-black/40 rounded-xl text-xs text-slate-400 space-y-1">
                <p>• सुनिश्चित गर्नुहोस् कि टिकट गिरिजा सिनेमा हल, जनकपुरको नै हो।</p>
                <p>• भुक्तानी सम्पन्न नभएका वा रद्द गरिएका टिकटहरूले प्रवेश पाउने छैनन्।</p>
              </div>
            </div>
          )}

          {/* Valid Ticket Decision Card */}
          {verifiedTicket && (
            <div className={`p-6 sm:p-7 rounded-3xl border-2 space-y-6 shadow-2xl transition-all ${
              verifiedTicket.isCheckedIn
                ? 'bg-amber-950/20 border-amber-500/60'
                : 'bg-emerald-950/20 border-emerald-500/60'
            }`}>
              
              {/* Gate Status Banner */}
              {verifiedTicket.isCheckedIn ? (
                <div className="flex items-center justify-between pb-4 border-b border-amber-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      <AlertTriangle className="w-7 h-7 animate-bounce" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400">चेतावनी (Already Used)</span>
                      <h3 className="text-lg sm:text-xl font-black text-white">दोहोरो प्रवेश निषेध (ALREADY CHECKED IN)</h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-amber-300 font-mono">
                      चेक-इन समय: {verifiedTicket.checkedInAt ? new Date(verifiedTicket.checkedInAt).toLocaleTimeString() : 'पहिले नै'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pb-4 border-b border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">प्रमाणीकरण सफल</span>
                      <h3 className="text-lg sm:text-xl font-black text-white">प्रवेश योग्य टिकट (VALID TICKET)</h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full">
                    ● भुक्तानी सम्पन्न
                  </span>
                </div>
              )}

              {/* Movie & Show Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">चलचित्र (Movie)</span>
                  <div className="text-base font-extrabold text-white flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-rose-500" />
                    <span>{verifiedTicket.show?.movie?.title || 'Pushpa 2: The Rule'}</span>
                  </div>
                  <div className="text-xs text-rose-400 font-medium">
                    {verifiedTicket.show?.screen?.name || 'Audi 1: Dolby Atmos 7.1'}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">शो समय र मिति (Showtime)</span>
                  <div className="text-base font-extrabold text-white flex items-center gap-1.5 font-mono">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{verifiedTicket.show?.startTime || '05:45 PM'} • {verifiedTicket.show?.date || 'Today'}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    Ref: <strong className="font-mono text-white">#{verifiedTicket.bookingRef}</strong>
                  </div>
                </div>
              </div>

              {/* Seats Grid (Most Important for Gatekeeper!) */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 uppercase">स्वीकृत सिट संख्या ({verifiedTicket.seats?.length || 0} सिटहरू):</span>
                  <span className="text-emerald-400 font-semibold font-mono">रू {verifiedTicket.totalAmount} (चुक्ता)</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {(verifiedTicket.seats || []).map(seatId => (
                    <span
                      key={seatId}
                      className="px-4 py-2 bg-gradient-to-tr from-rose-600 to-amber-500 text-white font-black text-sm rounded-xl shadow-md border border-white/20"
                    >
                      सिट {seatId}
                    </span>
                  ))}
                </div>
              </div>

              {/* Customer Contact Card */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <strong>{verifiedTicket.customerName}</strong>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{verifiedTicket.customerPhone}</span>
                </span>
              </div>

              {/* Action Button: Check In */}
              <div>
                {verifiedTicket.isCheckedIn ? (
                  <div className="p-3.5 bg-amber-950/40 rounded-xl border border-amber-600/40 text-center text-xs font-bold text-amber-300 flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>यो टिकट पहिले नै हल भित्र छ। दोहोरो प्रवेश अनुमति छैन!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleApproveEntry}
                    disabled={isCheckingIn}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-emerald-900/40 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isCheckingIn ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>प्रवेश प्रमाणीकरण हुँदैछ...</span>
                      </>
                    ) : (
                      <>
                        <DoorOpen className="w-5 h-5" />
                        <span>🚪 प्रवेश अनुमति दिनुहोस् (Approve Entry & Mark Used)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Recent Session Scans Log */}
          {recentCheckedIn.length > 0 && (
            <div className="bg-slate-900/60 p-5 rounded-3xl border border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>हालै प्रवेश स्वीकृत दर्शकहरू (Live Door Audit Log)</span>
                <span className="text-[10px] text-emerald-400 font-mono">{recentCheckedIn.length} admitted</span>
              </h4>

              <div className="divide-y divide-slate-800 text-xs">
                {recentCheckedIn.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <strong className="text-white font-mono">#{item.bookingRef}</strong>
                      <span className="text-slate-400">({item.customerName})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-amber-400 font-bold">{item.seats.join(', ')}</span>
                      <span className="text-[10px] text-slate-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
