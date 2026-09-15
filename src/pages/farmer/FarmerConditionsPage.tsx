import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../../components/common/Container';
import { Button } from '../../components/common/Button';
import { ConditionSelect } from '../../components/farmer/ConditionSelect';
import { CROPS } from '../../data/crops';
import { REGIONS, CLIMATE_ISSUES, CULTIVATION_PURPOSES } from '../../data/farmerOptions';
import { ROUTES } from '../../lib/routes';

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));
const CROP_OPTIONS = CROPS.map((crop) => ({ value: crop.id, label: crop.name }));

/**
 * 농업인 조건 입력 화면.
 * 지역 · 작물 · 농업 문제 · 재배 목적을 드롭다운으로 선택한 뒤
 * 분석 화면으로 이동합니다. (실제 추천 로직은 다음 단계에서 구현)
 */
export function FarmerConditionsPage() {
  const navigate = useNavigate();
  const [region, setRegion] = useState(REGIONS[0]);
  const [cropId, setCropId] = useState<string>(CROPS[0].id);
  const [issue, setIssue] = useState(CLIMATE_ISSUES[0]);
  const [purpose, setPurpose] = useState(CULTIVATION_PURPOSES[0]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({ region, crop: cropId, issue, purpose });
    navigate(`${ROUTES.farmerAnalyzing}?${params.toString()}`);
  };

  return (
    <Container className="flex flex-col gap-6 py-8 md:py-12">
      <header>
        <h1 className="text-2xl font-extrabold text-brand-green-dark sm:text-3xl">
          우리 농장 조건을 알려주세요
        </h1>
        <p className="mt-2 text-sm text-slate-500">우리 농장에 꼭 맞는 신품종을 추천해드려요.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-sm">
        <ConditionSelect
          id="region"
          icon="📍"
          label="지역"
          value={region}
          onChange={setRegion}
          options={toOptions(REGIONS)}
        />
        <ConditionSelect
          id="crop"
          icon="🌱"
          label="작물"
          value={cropId}
          onChange={setCropId}
          options={CROP_OPTIONS}
        />
        <ConditionSelect
          id="issue"
          icon="🌦️"
          label="농업 문제"
          value={issue}
          onChange={setIssue}
          options={toOptions(CLIMATE_ISSUES)}
        />
        <ConditionSelect
          id="purpose"
          icon="🎯"
          label="재배 목적"
          value={purpose}
          onChange={setPurpose}
          options={toOptions(CULTIVATION_PURPOSES)}
        />

        <Button type="submit" variant="primary" className="mt-2 w-full">
          신품종 추천받기 <span aria-hidden="true">→</span>
        </Button>
      </form>
    </Container>
  );
}
