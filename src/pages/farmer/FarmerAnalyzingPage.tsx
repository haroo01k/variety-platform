import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { AnalyzingStamp } from '../../components/farmer/AnalyzingStamp';
import { CROPS } from '../../data/crops';
import { CROP_PESTS } from '../../data/cropPests';
import { ROUTES } from '../../lib/routes';
import type { FarmerAnswers, FarmerResult } from '../../types/farmer';

/** 병해충 안내 3가지를 읽을 수 있도록 결과 화면으로 넘어가기 전 기다리는 시간 */
const AUTO_ADVANCE_MS = 6500;

interface LocationState {
  cropId: string;
  answers: FarmerAnswers;
  result: FarmerResult;
}

/**
 * 농업인 분석 화면.
 * FarmerConditionsPage에서 이미 계산된 결과(location.state)를 잠시 보여준 뒤
 * 결과 화면으로 넘겨줍니다. 기다리는 동안 선택한 작물의 대표 병해충 3가지(src/data/cropPests.ts)를 안내합니다. state가 없으면(새로고침 등) 조건 입력 화면으로 되돌립니다.
 */
export function FarmerAnalyzingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as LocationState | null;

  useEffect(() => {
    if (!state) return;
    const timer = setTimeout(() => {
      navigate(ROUTES.farmerResult, { replace: true, state });
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [navigate, state]);

  if (!state) {
    return (
      <Container className="flex flex-1 flex-col items-center justify-center gap-4 py-10 text-center">
        <p className="text-sm text-slate-500">입력한 조건을 찾을 수 없어요. 조건을 다시 입력해주세요.</p>
        <Button to={ROUTES.farmerConditions} variant="primary">
          조건 입력하기
        </Button>
      </Container>
    );
  }

  const crop = CROPS.find((c) => c.id === state.cropId) ?? CROPS[0];
  const pests = CROP_PESTS[crop.id];
  const goResult = () => navigate(ROUTES.farmerResult, { replace: true, state });

  return (
    <Container className="flex flex-1 flex-col items-center gap-6 py-8 text-center md:py-12">
      <section className="flex flex-col items-center gap-3">
        <p className="text-sm font-semibold text-brand-green">2 / 3 단계</p>
        <AnalyzingStamp crop={crop} durationMs={AUTO_ADVANCE_MS} />
        <h1 className="text-xl font-extrabold text-brand-green-dark sm:text-2xl">추천 품종을 분석하고 있어요</h1>
        <p className="max-w-sm text-sm text-slate-500">
          입력하신 지역·기후위험·용도 조건에 맞춰 {crop.name} 품종 데이터를 비교하고 있어요.
        </p>
      </section>

      {pests && (
        <section
          aria-label={`${crop.name} 대표 병해충`}
          className="w-full max-w-md rounded-3xl border-2 border-brand-yellow/40 bg-brand-yellow/10 p-5 text-left"
        >
          <p className="text-center text-base font-extrabold text-brand-orange">
            <span aria-hidden="true">⚠️ </span>잠깐! {crop.name} 대표 병해충 3가지를 주의하세요~!
          </p>
          <ol className="mt-4 flex flex-col gap-3">
            {pests.map((pest, i) => (
              <li
                key={pest.name}
                className="flex items-start gap-3 rounded-2xl bg-white p-3 shadow-sm motion-safe:animate-[result-card-in_0.4s_ease-out_both]"
                style={{ animationDelay: `${300 + i * 700}ms` }}
              >
                <span aria-hidden="true" className="no-text-scale flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-ivory text-2xl">
                  {pest.icon}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="flex items-center gap-2">
                    <span className="text-base font-bold text-slate-800">{pest.name}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        pest.kind === '병' ? 'bg-brand-green-light text-brand-green-dark' : 'bg-brand-orange/15 text-brand-orange'
                      }`}
                    >
                      {pest.kind}
                    </span>
                  </span>
                  <span className="text-sm leading-relaxed break-keep text-slate-600">{pest.tip}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Button variant="secondary" onClick={goResult}>
        결과 바로 보기 <span aria-hidden="true">→</span>
      </Button>
    </Container>
  );
}
