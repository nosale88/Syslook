import React from 'react';
import { Bell, Lock, Globe, CreditCard, UserCircle, Database, Palette } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">설정</h2>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium">일반 설정</h3>
          <p className="mt-1 text-sm text-gray-500">
            기본적인 시스템 설정을 관리합니다.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* 알림 설정 */}
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-base font-medium">알림 설정</h4>
              <p className="mt-1 text-sm text-gray-500">알림 수신 방법을 설정합니다.</p>
              <div className="mt-4 space-y-4">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm">이메일 알림</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm">SMS 알림</span>
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm">푸시 알림</span>
                </label>
              </div>
            </div>
          </div>

          {/* 보안 설정 */}
          <div className="pt-6 border-t">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-base font-medium">보안 설정</h4>
                <p className="mt-1 text-sm text-gray-500">계정 보안 설정을 관리합니다.</p>
                <div className="mt-4 space-y-4">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    비밀번호 변경
                  </button>
                  <div>
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm">2단계 인증 사용</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 언어 및 지역 설정 */}
          <div className="pt-6 border-t">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Globe className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-base font-medium">언어 및 지역 설정</h4>
                <p className="mt-1 text-sm text-gray-500">시스템 언어와 지역 설정을 관리합니다.</p>
                <div className="mt-4 space-y-4">
                  <select className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                    <option>한국어</option>
                    <option>English</option>
                    <option>日本語</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 결제 설정 */}
          <div className="pt-6 border-t">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CreditCard className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-base font-medium">결제 설정</h4>
                <p className="mt-1 text-sm text-gray-500">결제 방법과 청구 정보를 관리합니다.</p>
                <div className="mt-4">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    결제 수단 관리
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 테마 설정 */}
          <div className="pt-6 border-t">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Palette className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-base font-medium">테마 설정</h4>
                <p className="mt-1 text-sm text-gray-500">시스템 테마를 설정합니다.</p>
                <div className="mt-4 space-x-4">
                  <label className="inline-flex items-center">
                    <input type="radio" name="theme" value="light" className="form-radio text-blue-600" />
                    <span className="ml-2">라이트 모드</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input type="radio" name="theme" value="dark" className="form-radio text-blue-600" />
                    <span className="ml-2">다크 모드</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t text-right">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;