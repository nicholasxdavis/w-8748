
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { X } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Account created!",
          description: "Welcome to Lore! You can start exploring articles now.",
        });
        navigate('/');
      }
    } catch (error: any) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4 relative">
      {/* Close Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-10 p-2 rounded-full bg-gray-800/50 backdrop-blur-sm hover:bg-gray-700/50 transition-all duration-200 border border-gray-700 hover:scale-110"
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">Lore</h1>
          <p className="text-gray-400 text-sm sm:text-base">Discover knowledge in a new way</p>
        </div>

        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-800 rounded-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg sm:text-xl">Welcome</CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-6 rounded-xl">
                <TabsTrigger value="signin" className="text-white text-sm rounded-lg transition-all duration-200 hover:bg-gray-700">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-white text-sm rounded-lg transition-all duration-200 hover:bg-gray-700">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white text-sm">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-gray-800 border-gray-700 text-white text-sm h-10 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white text-sm">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="bg-gray-800 border-gray-700 text-white text-sm h-10 rounded-xl"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl transition-all duration-200 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white text-sm">First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        className="bg-gray-800 border-gray-700 text-white text-sm h-10 rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white text-sm">Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        className="bg-gray-800 border-gray-700 text-white text-sm h-10 rounded-xl"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupEmail" className="text-white text-sm">Email</Label>
                    <Input
                      id="signupEmail"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="bg-gray-800 border-gray-700 text-white text-sm h-10 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signupPassword" className="text-white text-sm">Password</Label>
                    <Input
                      id="signupPassword"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a password"
                      className="bg-gray-800 border-gray-700 text-white text-sm h-10 rounded-xl"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 rounded-xl transition-all duration-200 hover:scale-105"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* Terms and Policy Links */}
            <div className="mt-6 pt-4 border-t border-gray-700">
              <div className="flex justify-center space-x-4 text-xs text-gray-400 mb-3">
                <button
                  onClick={() => navigate('/terms')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </button>
                <span>•</span>
                <button
                  onClick={() => navigate('/privacy')}
                  className="hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </button>
              </div>
              <div className="text-center text-xs text-gray-500">
                © 2025 Lore by{' '}
                <a 
                  href="https://www.blacnova.net" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                >
                  Blacnova
                </a>
                . All rights reserved.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
