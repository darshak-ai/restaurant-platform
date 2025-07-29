import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useStore } from '../store/useStore';
import { orderApi } from '../services/api';
import { Order } from '../types';

export function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [otpCode, setOtpCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'otp' | 'processing' | 'success' | 'error'>('otp');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string>('');

  const { clearCart } = useStore();

  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate('/cart');
      return;
    }
  }, [orderData, navigate]);

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const transformedOrderData = {
        ...orderData,
        items: orderData.items.map((item: any) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          modifiers: null,
          special_instructions: item.special_instructions || null
        }))
      };
      
      const createdOrder = await orderApi.createOrder(transformedOrderData);
      
      const verificationResult = await orderApi.verifyOTP(
        createdOrder.id!,
        orderData.customer_phone,
        otpCode
      );

      if (verificationResult.verified) {
        setOrder(createdOrder);
        setStep('processing');
        
        setTimeout(() => {
          setStep('success');
          clearCart();
        }, 3000);
      } else {
        setError('Invalid OTP code. Please try again.');
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      setError(error.response?.data?.detail || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const transformedOrderData = {
        ...orderData,
        items: orderData.items.map((item: any) => ({
          menu_item_id: item.id,
          quantity: item.quantity,
          modifiers: null,
          special_instructions: item.special_instructions || null
        }))
      };
      
      const createdOrder = await orderApi.createOrder(transformedOrderData);
      setOrder(createdOrder);
      setStep('processing');
      
      setTimeout(() => {
        setStep('success');
        clearCart();
      }, 3000);
    } catch (error: any) {
      console.error('Order submission failed:', error);
      setError(error.response?.data?.detail || 'Failed to submit order. Please try again.');
      setStep('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderData) {
    return null;
  }

  if (step === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Your Order</h2>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600 mb-6">
            Your order has been successfully placed and payment processed.
          </p>
          
          {order && (
            <Card className="p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><strong>Order #:</strong> {order.order_number}</p>
                <p><strong>Total:</strong> ${order.total_amount.toFixed(2)}</p>
                <p><strong>Type:</strong> {order.order_type === 'pickup' ? 'Pickup' : 'Dine In'}</p>
                {order.estimated_ready_time && (
                  <p><strong>Ready Time:</strong> {order.estimated_ready_time}</p>
                )}
              </div>
            </Card>
          )}

          <div className="space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              Return to Home
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/menu')}
              className="w-full"
            >
              Order Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Failed</h2>
          <p className="text-gray-600 mb-6">{typeof error === 'string' ? error : 'An error occurred while processing your order.'}</p>
          
          <div className="space-y-3">
            <Button onClick={() => setStep('otp')} className="w-full">
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/cart')}
              className="w-full"
            >
              Back to Cart
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/cart')}
            className="mr-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        {/* Order Summary */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{orderData.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{orderData.customer_phone}</span>
            </div>
            <div className="flex justify-between">
              <span>Order Type:</span>
              <span>{orderData.order_type === 'pickup' ? 'Pickup' : 'Dine In'}</span>
            </div>
            <div className="flex justify-between">
              <span>Items:</span>
              <span>{orderData.items.length} item(s)</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${orderData.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* OTP Verification */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Verify Your Phone Number</h2>
            <p className="text-gray-600">
              We've sent a 6-digit verification code to {orderData.customer_phone}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter Verification Code
              </label>
              <Input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                className="text-center text-lg tracking-widest"
                maxLength={6}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {typeof error === 'string' ? error : 'An error occurred. Please try again.'}
              </div>
            )}

            <Button
              onClick={handleVerifyOTP}
              disabled={isVerifying || otpCode.length !== 6}
              className="w-full"
              size="lg"
            >
              {isVerifying ? 'Verifying...' : 'Verify & Place Order'}
            </Button>

            <div className="text-center">
              <button
                onClick={() => {/* TODO: Implement resend OTP */}}
                className="text-sm text-orange-600 hover:text-orange-700"
              >
                Didn't receive the code? Resend
              </button>
            </div>

            <div className="border-t pt-4">
              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                variant="outline"
                className="w-full"
              >
                {isSubmitting ? 'Submitting...' : 'Skip Verification (Demo)'}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                For demo purposes only - skips OTP verification
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
