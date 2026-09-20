export interface DailyCycleLog {
  date: string; // e.g. "15/09/2026"
  dayOfWeek: string; // e.g. "Tuesday"
  cycleDayText: string; // e.g. "Ngày 23 chu kỳ (Pha hoàng thể muộn)"
  cycleDayNumber?: number; // 1 to 28
  phase: 'menstrual' | 'proliferative' | 'ovulatory' | 'secretory' | 'prior_cycle';
  phaseLabel: string;
  summary: string;
  symptoms: string[];
  dischargeType: 'none' | 'normal' | 'orange_spotting' | 'fresh_blood' | 'brown_blood' | 'post_procedure_bleeding';
  dischargeLabel: string;
  painLevel: 'none' | 'mild' | 'moderate' | 'severe';
  painDescription?: string;
  eventNote?: string;
  clinicalInterpretation: string;
  isKeyMilestone?: boolean;
  // Sexual intimacy / Intimacy tracking (WomanLog)
  hasIntercourse?: boolean;
  intercourseProtection?: 'protected' | 'unprotected' | 'none';
  intercourseOrgasm?: boolean;
  intercourseCount?: number;
  intercourseNote?: string;
}

export interface CyclePhaseAnalysis {
  id: string;
  title: string;
  timeRange: string;
  cycleDays: string;
  physiologicState: string;
  endometrialThickness: string;
  clinicalMechanism: string;
  patientCorrelation: string;
  safetyVerdict: string;
}

export interface SymptomDecoder {
  symptom: string;
  laymanExplanation: string;
  scientificMechanism: string;
  whyNotCancer: string;
  actionGuidance: string;
}

export const menstrualCycleLogs: DailyCycleLog[] = [
  {
    date: '15/09/2026',
    dayOfWeek: 'Thứ Ba',
    cycleDayText: 'Ngày 23 (Hoàng thể muộn)',
    cycleDayNumber: 23,
    phase: 'secretory',
    phaseLabel: 'Pha Phân Tiết (Hoàng Thể)',
    summary: 'Nguyên ngày không ra dịch cam. Căng đau vú phải nhiều, vú trái đau ít hơn. Đau bụng dưới âm ỉ, có đau lưng. Nhận kết quả GPB BV Hùng Vương.',
    symptoms: ['Đau vú phải nhiều', 'Đau vú trái nhẹ', 'Đau bụng dưới', 'Đau lưng', 'Không ra dịch cam', 'Có kết quả Pipelle'],
    dischargeType: 'none',
    dischargeLabel: 'Không ra dịch cam (Sạch)',
    painLevel: 'moderate',
    painDescription: 'Căng đau ngực 2 bên (vú phải > vú trái), đau mỏi lưng và bụng dưới',
    eventNote: 'Nhận kết quả GPB BV Hùng Vương: "Tăng sản điển hình khu trú" (LÀNH TÍNH 100%)',
    clinicalInterpretation: 'Dấu hiệu tiền kinh nguyệt (PMS - Premenstrual Syndrome) kinh điển do hormone Progesterone đạt đỉnh ở pha hoàng thể làm giữ nước mô vú và co cơ trơn. Tuyệt đối KHÔNG PHẢI K vú tái phát.',
    isKeyMilestone: true,
  },
  {
    date: '14/09/2026',
    dayOfWeek: 'Thứ Hai',
    cycleDayText: 'Ngày 22 (Hoàng thể)',
    cycleDayNumber: 22,
    phase: 'secretory',
    phaseLabel: 'Pha Phân Tiết (Hoàng Thể)',
    summary: 'Tối ngủ đi tiểu có dính cam hơi nhiều. Cả ngày chậm không ra cam. Hơi dính nhẹ băng daily cam lợt.',
    symptoms: ['Dính cam lợt băng daily', 'Tiểu đêm dính cam'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Cam lợt (Lượng rất ít)',
    painLevel: 'none',
    clinicalInterpretation: 'Dịch tiết vi thể sau sinh thiết Pipelle ngày thứ 5 tiếp tục đào thải nốt khi bàng quang co bóp tống nước tiểu.',
  },
  {
    date: '13/09/2026',
    dayOfWeek: 'Chủ Nhật',
    cycleDayText: 'Ngày 21 (Hoàng thể)',
    cycleDayNumber: 21,
    phase: 'secretory',
    phaseLabel: 'Pha Phân Tiết (Hoàng Thể)',
    summary: 'Tối ngủ đi tiểu có dính cam hơi nhiều. Cả ngày 1 - 2 lần chậm ra cam.',
    symptoms: ['Dính cam khi đi tiểu', 'Vài giọt cam rải rác'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Đốm cam rải rác',
    painLevel: 'none',
    clinicalInterpretation: 'Dịch rỉ thanh huyết tương lẫn ít hồng cầu từ bề mặt niêm mạc đang biểu mô hóa sau sinh thiết.',
  },
  {
    date: '12/09/2026',
    dayOfWeek: 'Thứ Bảy',
    cycleDayText: 'Ngày 20 (Hoàng thể)',
    cycleDayNumber: 20,
    phase: 'secretory',
    phaseLabel: 'Pha Phân Tiết (Hoàng Thể)',
    summary: 'Nguyên ngày ra ít ít dính xíu cam tươi.',
    symptoms: ['Dính xíu cam tươi', 'Lượng cực ít'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Vệt cam tươi nhỏ',
    painLevel: 'none',
    clinicalInterpretation: 'Lớp niêm mạc đáy tử cung co hồi tốt, lượng dịch rỉ giảm trên 80% so với ngày đầu làm thủ thuật.',
  },
  {
    date: '11/09/2026',
    dayOfWeek: 'Thứ Sáu',
    cycleDayText: 'Ngày 19 (Hoàng thể)',
    cycleDayNumber: 19,
    phase: 'secretory',
    phaseLabel: 'Pha Phân Tiết (Hoàng Thể)',
    summary: 'Từ tối tới sáng không ra. Đến giờ cơm thấy đau lưng nhiều ra mấy giọt.',
    symptoms: ['Đau lưng nhiều', 'Ra vài giọt cam lúc trưa'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Vài giọt cam',
    painLevel: 'mild',
    painDescription: 'Đau mỏi lưng khi đứng lâu / giờ cơm',
    clinicalInterpretation: 'Tư thế đứng lâu làm tăng áp lực ổ bụng đẩy dịch đọng ở túi cùng âm đạo thoát ra ngoài; đau lưng do cơ thắt lưng và nội tiết hoàng thể.',
  },
  {
    date: '10/09/2026',
    dayOfWeek: 'Thứ Năm',
    cycleDayText: 'Ngày 18 (Hoàng thể)',
    cycleDayNumber: 18,
    phase: 'secretory',
    phaseLabel: 'Pha Phân Tiết (Hoàng Thể)',
    summary: 'Sáng thức dậy ra 2 đốm nhỏ daily. Thay băng mới đi tiểu không ra, trưa giờ cơm ra 2 đốm nhỏ. Cả ngày có đau bụng.',
    symptoms: ['2 đốm nhỏ daily sáng', '2 đốm nhỏ trưa', 'Đau bụng âm ỉ'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Đốm nhỏ cam nhạt',
    painLevel: 'mild',
    painDescription: 'Đau bụng dưới âm ỉ hồi phục sau can thiệp',
    clinicalInterpretation: 'Phản ứng hồi phục mô bình thường sau can thiệp xâm lấn lấy mẫu nội mạc tử cung.',
  },
  {
    date: '09/09/2026',
    dayOfWeek: 'Thứ Tư',
    cycleDayText: 'Ngày 17 (Sinh thiết Pipelle)',
    cycleDayNumber: 17,
    phase: 'secretory',
    phaseLabel: 'Pha Phân Tiết (Sinh Thiết Pipelle)',
    summary: '17:40 làm thủ thuật sinh thiết nội mạc tử cung Pipelle tại BV Hùng Vương. Đau quặn bụng dưới nhiều, mệt, mặt xanh tái. Tối 23:30 đau quặn từng cơn, kiểm tra băng daily thấy ra máu thấm 2 chỗ lớn.',
    symptoms: ['Làm sinh thiết Pipelle lúc 17h40', 'Đau quặn bụng nhiều', 'Mặt xanh tái', 'Mệt mỏi', 'Chảy máu thấm 2 chỗ lớn băng daily lúc 23h30'],
    dischargeType: 'post_procedure_bleeding',
    dischargeLabel: 'Chảy máu sau thủ thuật (2 vết lớn)',
    painLevel: 'severe',
    painDescription: 'Đau quặn bụng dưới từng cơn do que Pipelle cọ sát và tử cung co thắt phản xạ',
    eventNote: 'THỦ THUẬT PIPELLE BV HÙNG VƯƠNG (17h40): Can thiệp cơ học lấy mẫu mô lòng tử cung',
    clinicalInterpretation: 'CỰC KỲ QUAN TRỌNG: Ngày 17 chu kỳ là thời điểm niêm mạc tử cung dày sinh lý tối đa (Pha phân tiết). Máu ra và đau quặn là do can thiệp cơ học que Pipelle, không phải xuất huyết bệnh lý tự nhiên.',
    isKeyMilestone: true,
  },
  {
    date: '08/09/2026',
    dayOfWeek: 'Thứ Ba',
    cycleDayText: 'Ngày 16 (Cuối rụng trứng)',
    cycleDayNumber: 16,
    phase: 'ovulatory',
    phaseLabel: 'Pha Rụng Trứng (Quanh Ovulation)',
    summary: 'Trưa tiểu lau ra cam tươi. Tối tiểu không ra.',
    symptoms: ['Trưa lau ra cam tươi', 'Tối bình thường'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Cam tươi (Lau giấy)',
    painLevel: 'none',
    clinicalInterpretation: 'Vi mạch niêm mạc rỉ vài hồng cầu hòa lẫn dịch nhầy trong suốt cổ tử cung tạo màu cam tươi.',
  },
  {
    date: '07/09/2026',
    dayOfWeek: 'Thứ Hai',
    cycleDayText: 'Ngày 15 (Rụng trứng)',
    cycleDayNumber: 15,
    phase: 'ovulatory',
    phaseLabel: 'Pha Rụng Trứng (Quanh Ovulation)',
    summary: 'Sáng thức dậy không thấy ra. Trưa 1-2h có ra dính nhẹ. Sau quan hệ lau có dính cam.',
    symptoms: ['Dính nhẹ buổi trưa', 'Dính cam sau sinh hoạt vợ chồng'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Dính cam sau quan hệ',
    painLevel: 'none',
    clinicalInterpretation: 'Cổ tử cung và niêm mạc đang xung huyết trong pha rụng trứng; cọ sát cơ học khi sinh hoạt tạo ra vài đốm vi thể màu cam vô hại.',
    hasIntercourse: true,
    intercourseProtection: 'protected',
    intercourseCount: 1,
    intercourseOrgasm: true,
    intercourseNote: 'Dính cam nhẹ sau sinh hoạt vợ chồng'
  },
  {
    date: '06/09/2026',
    dayOfWeek: 'Chủ Nhật',
    cycleDayText: 'Ngày 14 (Đỉnh rụng trứng)',
    cycleDayNumber: 14,
    phase: 'ovulatory',
    phaseLabel: 'Pha Rụng Trứng (Đỉnh Phóng Noãn)',
    summary: 'Sáng thức dậy lau không ra. Cả ngày không ra. Tối ngủ đi tiểu ra dính băng daily.',
    symptoms: ['Ban ngày sạch', 'Tối tiểu dính nhẹ daily'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Dính nhẹ daily tối',
    painLevel: 'none',
    clinicalInterpretation: 'Hiện tượng "Rỉ máu quanh rụng trứng" (Periovulatory spotting) do nồng độ Estrogen giảm tạm thời khi nang noãn vỡ phóng noãn.',
    isKeyMilestone: true,
  },
  {
    date: '05/09/2026',
    dayOfWeek: 'Thứ Bảy',
    cycleDayText: 'Ngày 13 (Tiền rụng trứng)',
    cycleDayNumber: 13,
    phase: 'ovulatory',
    phaseLabel: 'Pha Rụng Trứng',
    summary: 'Sáng thức dậy không thấy ra. Cả ngày hoàn toàn không ra.',
    symptoms: ['Sạch hoàn toàn', 'Không đau'],
    dischargeType: 'none',
    dischargeLabel: 'Không ra (Sạch)',
    painLevel: 'none',
    clinicalInterpretation: 'Nội tiết Estrogen tăng cao chuẩn bị phóng noãn, cổ tử cung tăng tiết dịch nhầy trong dai sinh lý.',
  },
  {
    date: '04/09/2026',
    dayOfWeek: 'Thứ Sáu',
    cycleDayText: 'Ngày 12 (Tiền rụng trứng)',
    cycleDayNumber: 12,
    phase: 'ovulatory',
    phaseLabel: 'Pha Rụng Trứng',
    summary: 'Sáng thức dậy không ra. Cả ngày không ra.',
    symptoms: ['Sạch hoàn toàn'],
    dischargeType: 'none',
    dischargeLabel: 'Không ra (Sạch)',
    painLevel: 'none',
    clinicalInterpretation: 'Giai đoạn bình thường ổn định.',
  },
  {
    date: '03/09/2026',
    dayOfWeek: 'Thứ Năm',
    cycleDayText: 'Ngày 11 (Tăng sinh muộn)',
    cycleDayNumber: 11,
    phase: 'ovulatory',
    phaseLabel: 'Pha Rụng Trứng',
    summary: 'Sáng thức dậy ra ít huyết trắng cam nhạt. Cả ngày không ra.',
    symptoms: ['Ít huyết trắng cam nhạt sáng sớm', 'Ban ngày sạch'],
    dischargeType: 'orange_spotting',
    dischargeLabel: 'Huyết trắng cam nhạt',
    painLevel: 'none',
    clinicalInterpretation: 'Máu vi thể tồn đọng bị oxy hóa trong môi trường âm đạo có tính axit chuyển thành sắc tố vàng cam / cam nhạt.',
  },
  {
    date: '02/09/2026',
    dayOfWeek: 'Thứ Tư',
    cycleDayText: 'Ngày 10 (Sạch kinh)',
    cycleDayNumber: 10,
    phase: 'proliferative',
    phaseLabel: 'Pha Tăng Sinh (Sạch Kinh)',
    summary: 'Sạch kinh hoàn toàn. Người khoẻ khoắn, thoải mái.',
    symptoms: ['Sạch kinh 100%', 'Người khoẻ'],
    dischargeType: 'none',
    dischargeLabel: 'Sạch hoàn toàn',
    painLevel: 'none',
    clinicalInterpretation: 'Niêm mạc tử cung tái tạo lành lặn, buồng tử cung sạch sẽ.',
  },
  {
    date: '01/09/2026',
    dayOfWeek: 'Thứ Ba',
    cycleDayText: 'Ngày 9 (Cuối kỳ kinh)',
    cycleDayNumber: 9,
    phase: 'proliferative',
    phaseLabel: 'Pha Tăng Sinh',
    summary: 'Kinh còn rất ít, màu sậm, lau nhẹ dính giấy vệ sinh.',
    symptoms: ['Kinh còn rất ít', 'Màu sậm'],
    dischargeType: 'brown_blood',
    dischargeLabel: 'Kinh sậm cuối kỳ',
    painLevel: 'none',
    clinicalInterpretation: 'Máu kinh oxy hóa đào thải nốt giai đoạn cuối.',
  },
  {
    date: '31/08/2026',
    dayOfWeek: 'Thứ Hai',
    cycleDayText: 'Ngày 8 (Tập aerobic)',
    cycleDayNumber: 8,
    phase: 'proliferative',
    phaseLabel: 'Pha Tăng Sinh',
    summary: 'Sau khi tập aerobic ra lại một ít đỏ tươi, sau đó ngưng hẳn.',
    symptoms: ['Ra ít máu đỏ tươi sau tập aerobic', 'Sau đó tự ngưng'],
    dischargeType: 'fresh_blood',
    dischargeLabel: 'Đỏ tươi sau vận động',
    painLevel: 'none',
    clinicalInterpretation: 'Vận động thể thao nhịp điệu (aerobic) làm tăng áp lực ổ bụng và tăng co bóp cơ tử cung tống nốt dịch máu đọng ở đáy tử cung.',
  },
  {
    date: '30/08/2026',
    dayOfWeek: 'Chủ Nhật',
    cycleDayText: 'Ngày 7 (Kinh ngày 7)',
    cycleDayNumber: 7,
    phase: 'menstrual',
    phaseLabel: 'Pha Hành Kinh',
    summary: 'Kinh ít dần, chỉ dính nhẹ băng vệ sinh hàng ngày.',
    symptoms: ['Kinh lượng ít', 'Chỉ dính băng daily'],
    dischargeType: 'brown_blood',
    dischargeLabel: 'Nâu nhạt lượng ít',
    painLevel: 'none',
    clinicalInterpretation: 'Giai đoạn cầm máu tự nhiên của pha hành kinh.',
  },
  {
    date: '29/08/2026',
    dayOfWeek: 'Thứ Bảy',
    cycleDayText: 'Ngày 6 (Kinh ngày 6)',
    cycleDayNumber: 6,
    phase: 'menstrual',
    phaseLabel: 'Pha Hành Kinh',
    summary: 'Kinh ngày 6, lượng ít, màu nâu sẫm.',
    symptoms: ['Lượng ít', 'Màu nâu sẫm'],
    dischargeType: 'brown_blood',
    dischargeLabel: 'Nâu sẫm',
    painLevel: 'none',
    clinicalInterpretation: 'Kinh giảm dần, máu lưu chuyển chậm nên có màu nâu sẫm.',
  },
  {
    date: '28/08/2026',
    dayOfWeek: 'Thứ Sáu',
    cycleDayText: 'Ngày 5 (Kinh ngày 5)',
    cycleDayNumber: 5,
    phase: 'menstrual',
    phaseLabel: 'Pha Hành Kinh',
    summary: 'Kinh ngày 5, lượng giảm rõ rệt.',
    symptoms: ['Lượng máu giảm rõ'],
    dischargeType: 'fresh_blood',
    dischargeLabel: 'Đỏ sậm lượng ít',
    painLevel: 'none',
    clinicalInterpretation: 'Bắt đầu chuyển sang giai đoạn tái tạo biểu mô.',
  },
  {
    date: '27/08/2026',
    dayOfWeek: 'Thứ Năm',
    cycleDayText: 'Ngày 4 (Kinh ngày 4)',
    cycleDayNumber: 4,
    phase: 'menstrual',
    phaseLabel: 'Pha Hành Kinh',
    summary: 'Kinh ngày 4, lượng vừa, đỡ mệt mỏi hơn.',
    symptoms: ['Lượng vừa', 'Đỡ mệt'],
    dischargeType: 'fresh_blood',
    dischargeLabel: 'Kinh lượng vừa',
    painLevel: 'mild',
    painDescription: 'Đỡ mệt hơn',
    clinicalInterpretation: 'Pha hành kinh diễn tiến bình thường.',
  },
  {
    date: '26/08/2026',
    dayOfWeek: 'Thứ Tư',
    cycleDayText: 'Ngày 3 (Kinh ngày 3)',
    cycleDayNumber: 3,
    phase: 'menstrual',
    phaseLabel: 'Pha Hành Kinh',
    summary: 'Kinh ngày 3, lượng nhiều vừa, người mệt, đau lưng nhẹ.',
    symptoms: ['Lượng nhiều vừa', 'Người mệt', 'Đau lưng nhẹ'],
    dischargeType: 'fresh_blood',
    dischargeLabel: 'Kinh nhiều vừa',
    painLevel: 'moderate',
    painDescription: 'Người mệt mỏi, đau mỏi thắt lưng',
    clinicalInterpretation: 'Máu kinh ra nhiều kết hợp co bóp tử cung gây cảm giác mệt mỏi và đau lưng.',
  },
  {
    date: '25/08/2026',
    dayOfWeek: 'Thứ Ba',
    cycleDayText: 'Ngày 2 (Kinh ngày 2)',
    cycleDayNumber: 2,
    phase: 'menstrual',
    phaseLabel: 'Pha Hành Kinh',
    summary: 'Kinh ngày 2, lượng nhiều, đau quặn bụng dưới, đau lưng rõ.',
    symptoms: ['Lượng kinh nhiều', 'Đau quặn bụng dưới', 'Đau lưng nhiều'],
    dischargeType: 'fresh_blood',
    dischargeLabel: 'Kinh lượng nhiều',
    painLevel: 'moderate',
    painDescription: 'Đau quặn bụng kinh, đau lưng',
    clinicalInterpretation: 'Nội mạc bong tróc hàng loạt dưới tác động của Prostaglandin làm cơ tử cung co thắt tống máu.',
  },
  {
    date: '24/08/2026',
    dayOfWeek: 'Thứ Hai',
    cycleDayText: 'Ngày 1 (Bắt đầu kỳ kinh)',
    cycleDayNumber: 1,
    phase: 'menstrual',
    phaseLabel: 'Pha Hành Kinh (Bắt Đầu Chu Kỳ)',
    summary: 'Bắt đầu chu kỳ kinh nguyệt (Ngày 1). Ra kinh lúc 22h, đau lưng nhiều, đau bụng dưới âm ỉ.',
    symptoms: ['Bắt đầu ra kinh lúc 22h', 'Đau lưng nhiều', 'Đau bụng dưới âm ỉ'],
    dischargeType: 'fresh_blood',
    dischargeLabel: 'Bắt đầu ra kinh (Đỏ)',
    painLevel: 'moderate',
    painDescription: 'Đau lưng nhiều, đau quặn bụng dưới',
    eventNote: 'BẮT ĐẦU CHU KỲ KINH NGUYỆT MỚI (Lúc 22h đêm)',
    clinicalInterpretation: 'Ngày 1 của chu kỳ kinh nguyệt. Mọi tính toán ngày rụng trứng và ngày sinh thiết Pipelle đều quy chiếu từ mốc 24/08 này.',
    isKeyMilestone: true,
  },
  {
    date: '01/08 - 23/08/2026',
    dayOfWeek: 'Giai đoạn trước',
    cycleDayText: 'Chu kỳ trước',
    phase: 'prior_cycle',
    phaseLabel: 'Chu Kỳ Trước',
    summary: 'Giai đoạn chuẩn bị chu kỳ mới, sinh hoạt đều đặn và lành mạnh.',
    symptoms: ['Sạch sẽ', 'Không đau bụng'],
    dischargeType: 'none',
    dischargeLabel: 'Bình thường',
    painLevel: 'none',
    clinicalInterpretation: 'Giai đoạn chuyển tiếp giữa hai chu kỳ kinh nguyệt.',
  }
];

export const cyclePhaseAnalyses: CyclePhaseAnalysis[] = [
  {
    id: 'menstrual-phase',
    title: '1. Pha Hành Kinh (Menstrual Phase)',
    timeRange: 'Ngày 1 – Ngày 7 của chu kỳ',
    cycleDays: 'Khoảng 3 – 7 ngày',
    physiologicState: 'Hoàng thể chu kỳ trước thoái hóa, nồng độ Estrogen và Progesterone giảm kích thích Prostaglandin làm co thắt nhẹ mạch máu xoắn và bong tróc lớp niêm mạc chức năng.',
    endometrialThickness: 'Giảm dần từ 8-10mm xuống còn 2-4mm vào cuối kỳ kinh.',
    clinicalMechanism: 'Tử cung co thắt sinh lý để đào thải lớp niêm mạc chức năng và máu kinh, sau đó các yếu tố đông máu tự nhiên giúp cầm máu dần.',
    patientCorrelation: 'Diễn tiến điển hình: Ngày đầu lượng vừa/nhiều, đau mỏi lưng nhẹ, sau đó lượng máu giảm dần và sạch kinh hoàn toàn.',
    safetyVerdict: 'Hiện tượng sinh lý tự nhiên bình thường của hệ sinh sản nữ.',
  },
  {
    id: 'proliferative-phase',
    title: '2. Pha Tăng Sinh (Proliferative Phase)',
    timeRange: 'Ngày 8 – Ngày 10 của chu kỳ',
    cycleDays: 'Khoảng 5 – 8 ngày',
    physiologicState: 'Các nang noãn buồng trứng phát triển tiết Estrogen giúp tái tạo và tăng sinh biểu mô phủ, biểu mô tuyến lòng tử cung.',
    endometrialThickness: 'Tăng dần từ 4mm lên 7-8mm.',
    clinicalMechanism: 'Estrogen kích thích sự phân chia tế bào niêm mạc, làm giàu mạng lưới mao mạch và tuyến nội mạc tử cung.',
    patientCorrelation: 'Cơ thể sạch kinh, phục hồi năng lượng và cảm thấy thoải mái, người khỏe khoắn.',
    safetyVerdict: 'Lớp niêm mạc tái tạo tốt, không có xuất huyết bất thường.',
  },
  {
    id: 'ovulatory-phase',
    title: '3. Pha Rụng Trứng (Ovulatory Phase)',
    timeRange: 'Ngày 11 – Ngày 16 của chu kỳ',
    cycleDays: 'Đỉnh phóng noãn: Ngày 14 (hoặc 14 ngày trước kỳ kinh sau)',
    physiologicState: 'Nồng độ Estrogen và LH đạt đỉnh kích thích phóng noãn. Cổ tử cung tiết dịch nhầy trong suốt, dai co giãn sinh lý.',
    endometrialThickness: 'Dày khoảng 8-11mm, xuất hiện cấu trúc 3 lá (Trilaminar) trên siêu âm.',
    clinicalMechanism: 'Sự sụt giảm nhẹ Estrogen ngay lúc nang noãn vỡ có thể gây rỉ vài giọt hồng cầu vi thể, khi hòa với dịch nhầy cổ tử cung có thể tạo đốm cam/hồng nhạt.',
    patientCorrelation: 'Dịch tiết âm đạo trong dai, có thể xuất hiện đốm cam/vàng nhạt trong 1-2 ngày quanh thời điểm phóng noãn.',
    safetyVerdict: 'Hiện tượng "Rỉ máu quanh rụng trứng" (Periovulatory Spotting) hoàn toàn lành tính.',
  },
  {
    id: 'secretory-phase',
    title: '4. Pha Phân Tiết / Hoàng Thể (Secretory Phase)',
    timeRange: 'Ngày 17 – Ngày 28 của chu kỳ',
    cycleDays: 'Khoảng 12 – 14 ngày cố định',
    physiologicState: 'Hoàng thể tiết lượng lớn Progesterone làm các tuyến nội mạc cuộn xoắn, giãn rộng chứa đầy glycogen và dịch dinh dưỡng nuôi dưỡng phôi.',
    endometrialThickness: 'Dày sinh lý tối đa: 10 – 16mm.',
    clinicalMechanism: 'Progesterone kích thích mô đệm phù nề, giữ nước nhẹ toàn thân và làm căng các tiểu thùy tuyến vú (Hội chứng tiền kinh nguyệt - PMS).',
    patientCorrelation: 'Căng tức ngực hai bên, đau mỏi thắt lưng hoặc đau bụng dưới âm ỉ vài ngày trước khi chu kỳ kinh mới bắt đầu.',
    safetyVerdict: 'Sinh lý pha hoàng thể ổn định, phản ánh buồng trứng có phóng noãn đều đặn.',
  }
];

export const symptomDecoders: SymptomDecoder[] = [
  {
    symptom: '1. Huyết Trắng Màu Cam / Đốm Cam (Orange Spotting)',
    laymanExplanation: 'Máu vi thể (vài giọt li ti) hòa lẫn với dịch nhờn âm đạo có tính axit, khiến màu biến đổi thành màu vàng cam hoặc cam nhạt.',
    scientificMechanism: 'Hemoglobin trong máu khi tiếp xúc với môi trường axit tự nhiên của âm đạo (pH 3.8 - 4.5) sẽ bị oxy hóa nhẹ, tạo thành sắc tố màu cam/hồng nhạt thay vì đỏ tươi.',
    whyNotCancer: 'Hiện tượng này xuất hiện theo chu kỳ quanh ngày rụng trứng hoặc sau vận động mạnh/sinh hoạt vợ chồng, tự hết sau 1-2 ngày.',
    actionGuidance: 'Giữ vệ sinh nhẹ nhàng, sử dụng băng hàng ngày mỏng và theo dõi ngày chu kỳ.',
  },
  {
    symptom: '2. Căng Đau Tức Ngực Tiền Kinh Nguyệt (PMS Mastalgia)',
    laymanExplanation: 'Ngực căng tức giống như dấu hiệu sắp đến kỳ kinh hàng tháng do cơ thể giữ nước nhẹ dưới tác động của nội tiết tố.',
    scientificMechanism: 'Vào pha hoàng thể muộn, nồng độ Progesterone và Estrogen tăng cao kích thích các tuyến và ống dẫn trong mô vú giãn nở tạm thời.',
    whyNotCancer: 'Căng đau xuất hiện đối xứng hai bên ngực vào những ngày cuối chu kỳ và tự hết hoàn toàn khi kỳ kinh mới bắt đầu.',
    actionGuidance: 'Mặc áo ngực thoải mái không gọng, chườm ấm nhẹ và giảm ăn mặn trong những ngày cuối chu kỳ.',
  },
  {
    symptom: '3. Đau Quặn Bụng Dưới & Mỏi Lưng Khi Hành Kinh',
    laymanExplanation: 'Tử cung co bóp nhẹ để tống xuất máu kinh và lớp niêm mạc cũ ra ngoài cơ thể.',
    scientificMechanism: 'Hợp chất Prostaglandin được giải phóng tại niêm mạc tử cung kích thích cơ trơn tử cung co thắt nhịp nhàng để đào thải dịch kinh nguyệt.',
    whyNotCancer: 'Đau có tính chất chu kỳ, rõ nhất vào 1-2 ngày đầu hành kinh và giảm dần nhanh chóng.',
    actionGuidance: 'Chườm ấm bụng dưới, uống nước ấm, nghỉ ngơi hợp lý và duy trì vận động nhẹ nhàng.',
  }
];

// =========================================================================
// LỊCH SỬ CHU KỲ KINH NGUYỆT MẪU (LỊCH SỬ THEO DÕI)
// =========================================================================

export interface HistoricalCycle {
  id: string;
  startDate: string;
  endDate: string;
  dateRangeDisplay: string;
  year: number;
  cycleLengthDays: number;
  periodDurationDays: number;
  cycleType: 'normal_long' | 'standard' | 'delayed_long' | 'short_breakthrough';
  cycleTypeLabel: string;
  clinicalNote: string;
}

export interface HistoricalCycleStats {
  totalTrackedCycles: number;
  trackingDurationYears: string;
  averageCycleLength: number; // e.g. 36.8 days
  medianCycleLength: number; // e.g. 37 days
  shortestCycle: number; // 19 days
  longestCycle: number; // 50 days
  averagePeriodDuration: number; // 5 days
  longCyclePercentage: number; // % of cycles between 35-42 days (~80%)
  ovulationWindowEstimate: string; // e.g. "Ngày 21 – 26 chu kỳ"
  clinicalConclusion: string;
}

export const historicalCyclesData: HistoricalCycle[] = [
  // --- NĂM 2026 ---
  {
    id: 'cycle-2026-08',
    startDate: 'Aug 24, 2026',
    endDate: 'Hiện tại',
    dateRangeDisplay: '24/08/2026 – [Đang diễn ra]',
    year: 2026,
    cycleLengthDays: 24,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ hiện tại (Đang ở Ngày 23/24)',
    clinicalNote: 'Kỳ kinh bắt đầu ngày 24/08. Pha hoàng thể diễn tiến sinh lý bình thường với các dấu hiệu tiền kinh nguyệt (PMS).'
  },
  {
    id: 'cycle-2026-07',
    startDate: 'Jul 27, 2026',
    endDate: 'Aug 23, 2026',
    dateRangeDisplay: '27/07/2026 – 23/08/2026',
    year: 2026,
    cycleLengthDays: 28,
    periodDurationDays: 6,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (28 ngày)',
    clinicalNote: 'Hành kinh 6 ngày, chu kỳ 28 ngày lý tưởng.'
  },
  {
    id: 'cycle-2026-06',
    startDate: 'Jun 29, 2026',
    endDate: 'Jul 26, 2026',
    dateRangeDisplay: '29/06/2026 – 26/07/2026',
    year: 2026,
    cycleLengthDays: 28,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (28 ngày)',
    clinicalNote: 'Hành kinh 5 ngày, chu kỳ 28 ngày đều đặn.'
  },
  {
    id: 'cycle-2026-05',
    startDate: 'May 27, 2026',
    endDate: 'Jun 28, 2026',
    dateRangeDisplay: '27/05/2026 – 28/06/2026',
    year: 2026,
    cycleLengthDays: 33,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ bình thường (33 ngày)',
    clinicalNote: 'Hành kinh 5 ngày, diễn tiến bình thường.'
  },
  {
    id: 'cycle-2026-04',
    startDate: 'Apr 24, 2026',
    endDate: 'May 26, 2026',
    dateRangeDisplay: '24/04/2026 – 26/05/2026',
    year: 2026,
    cycleLengthDays: 33,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ bình thường (33 ngày)',
    clinicalNote: 'Hành kinh 5 ngày, chu kỳ 33 ngày.'
  },
  {
    id: 'cycle-2026-03',
    startDate: 'Mar 28, 2026',
    endDate: 'Apr 23, 2026',
    dateRangeDisplay: '28/03/2026 – 23/04/2026',
    year: 2026,
    cycleLengthDays: 27,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (27 ngày)',
    clinicalNote: 'Hành kinh 5 ngày, chu kỳ ngắn hơn bình thường.'
  },
  {
    id: 'cycle-2026-02',
    startDate: 'Feb 13, 2026',
    endDate: 'Mar 27, 2026',
    dateRangeDisplay: '13/02/2026 – 27/03/2026',
    year: 2026,
    cycleLengthDays: 43,
    periodDurationDays: 5,
    cycleType: 'delayed_long',
    cycleTypeLabel: 'Chu kỳ dài (43 ngày)',
    clinicalNote: 'Chu kỳ dài sinh lý do biến thiên thời gian rụng trứng.'
  },
  {
    id: 'cycle-2026-01',
    startDate: 'Jan 14, 2026',
    endDate: 'Feb 12, 2026',
    dateRangeDisplay: '14/01/2026 – 12/02/2026',
    year: 2026,
    cycleLengthDays: 30,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (30 ngày)',
    clinicalNote: 'Chu kỳ 30 ngày đều đặn.'
  },

  // --- NĂM 2025 ---
  {
    id: 'cycle-2025-09',
    startDate: 'Dec 15, 2025',
    endDate: 'Jan 13, 2026',
    dateRangeDisplay: '15/12/2025 – 13/01/2026',
    year: 2025,
    cycleLengthDays: 30,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (30 ngày)',
    clinicalNote: 'Chu kỳ chuyển tiếp đều đặn.'
  },
  {
    id: 'cycle-2025-08',
    startDate: 'Nov 13, 2025',
    endDate: 'Dec 14, 2025',
    dateRangeDisplay: '13/11/2025 – 14/12/2025',
    year: 2025,
    cycleLengthDays: 32,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (32 ngày)',
    clinicalNote: 'Hành kinh 5 ngày đều đặn.'
  },
  {
    id: 'cycle-2025-07',
    startDate: 'Oct 12, 2025',
    endDate: 'Nov 12, 2025',
    dateRangeDisplay: '12/10/2025 – 12/11/2025',
    year: 2025,
    cycleLengthDays: 32,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (32 ngày)',
    clinicalNote: 'Hành kinh 5 ngày.'
  },
  {
    id: 'cycle-2025-06',
    startDate: 'Aug 10, 2025',
    endDate: 'Sep 13, 2025',
    dateRangeDisplay: '10/08/2025 – 13/09/2025',
    year: 2025,
    cycleLengthDays: 35,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (35 ngày)',
    clinicalNote: 'Hành kinh 5 ngày, chu kỳ 35 ngày.'
  },
  {
    id: 'cycle-2025-05',
    startDate: 'Jul 10, 2025',
    endDate: 'Aug 9, 2025',
    dateRangeDisplay: '10/07/2025 – 09/08/2025',
    year: 2025,
    cycleLengthDays: 31,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (31 ngày)',
    clinicalNote: 'Chu kỳ mùa hè 31 ngày.'
  },
  {
    id: 'cycle-2025-04',
    startDate: 'May 31, 2025',
    endDate: 'Jul 9, 2025',
    dateRangeDisplay: '31/05/2025 – 09/07/2025',
    year: 2025,
    cycleLengthDays: 40,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (40 ngày)',
    clinicalNote: 'Độ dài 40 ngày, hành kinh 5 ngày.'
  },
  {
    id: 'cycle-2025-03',
    startDate: 'Apr 25, 2025',
    endDate: 'May 30, 2025',
    dateRangeDisplay: '25/04/2025 – 30/05/2025',
    year: 2025,
    cycleLengthDays: 36,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (36 ngày)',
    clinicalNote: 'Hành kinh 5 ngày.'
  },
  {
    id: 'cycle-2025-02',
    startDate: 'Feb 10, 2025',
    endDate: 'Mar 16, 2025',
    dateRangeDisplay: '10/02/2025 – 16/03/2025',
    year: 2025,
    cycleLengthDays: 35,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (35 ngày)',
    clinicalNote: 'Chu kỳ 35 ngày.'
  },
  {
    id: 'cycle-2025-01',
    startDate: 'Jan 4, 2025',
    endDate: 'Feb 9, 2025',
    dateRangeDisplay: '04/01/2025 – 09/02/2025',
    year: 2025,
    cycleLengthDays: 37,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (37 ngày)',
    clinicalNote: 'Độ dài 37 ngày mở đầu năm 2025.'
  },

  // --- NĂM 2024 ---
  {
    id: 'cycle-2024-10',
    startDate: 'Dec 18, 2024',
    endDate: 'Jan 3, 2025',
    dateRangeDisplay: '18/12/2024 – 03/01/2025',
    year: 2024,
    cycleLengthDays: 17,
    periodDurationDays: 5,
    cycleType: 'short_breakthrough',
    cycleTypeLabel: 'Chu kỳ ngắn đột xuất (17 ngày)',
    clinicalNote: 'Chu kỳ ngắn do thoái hóa sớm nang noãn.'
  },
  {
    id: 'cycle-2024-09',
    startDate: 'Nov 9, 2024',
    endDate: 'Dec 17, 2024',
    dateRangeDisplay: '09/11/2024 – 17/12/2024',
    year: 2024,
    cycleLengthDays: 39,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (39 ngày)',
    clinicalNote: 'Chu kỳ dài tự nhiên, rụng trứng quanh ngày 23-25.'
  },
  {
    id: 'cycle-2024-08',
    startDate: 'Sep 29, 2024',
    endDate: 'Nov 8, 2024',
    dateRangeDisplay: '29/09/2024 – 08/11/2024',
    year: 2024,
    cycleLengthDays: 41,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (41 ngày)',
    clinicalNote: 'Chu kỳ 41 ngày, hành kinh 5 ngày.'
  },
  {
    id: 'cycle-2024-07',
    startDate: 'Aug 24, 2024',
    endDate: 'Sep 28, 2024',
    dateRangeDisplay: '24/08/2024 – 28/09/2024',
    year: 2024,
    cycleLengthDays: 36,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (36 ngày)',
    clinicalNote: 'Rất đều đặn.'
  },
  {
    id: 'cycle-2024-06',
    startDate: 'Jul 21, 2024',
    endDate: 'Aug 23, 2024',
    dateRangeDisplay: '21/07/2024 – 23/08/2024',
    year: 2024,
    cycleLengthDays: 34,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ bình thường (34 ngày)',
    clinicalNote: 'Chu kỳ 34 ngày.'
  },
  {
    id: 'cycle-2024-05',
    startDate: 'Jun 20, 2024',
    endDate: 'Jul 20, 2024',
    dateRangeDisplay: '20/06/2024 – 20/07/2024',
    year: 2024,
    cycleLengthDays: 31,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (31 ngày)',
    clinicalNote: 'Hành kinh 5 ngày, chu kỳ đều đặn, pha hoàng thể 12-14 ngày.'
  },
  {
    id: 'cycle-2024-04',
    startDate: 'May 12, 2024',
    endDate: 'Jun 19, 2024',
    dateRangeDisplay: '12/05/2024 – 19/06/2024',
    year: 2024,
    cycleLengthDays: 39,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (39 ngày)',
    clinicalNote: 'Cơ địa chu kỳ dài kinh điển, rụng trứng quanh ngày 23-25.'
  },
  {
    id: 'cycle-2024-03',
    startDate: 'Apr 7, 2024',
    endDate: 'May 11, 2024',
    dateRangeDisplay: '07/04/2024 – 11/05/2024',
    year: 2024,
    cycleLengthDays: 35,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (35 ngày)',
    clinicalNote: 'Hành kinh 5 ngày gọn gàng, pha tăng sinh kéo dài 20 ngày.'
  },
  {
    id: 'cycle-2024-02',
    startDate: 'Feb 17, 2024',
    endDate: 'Apr 6, 2024',
    dateRangeDisplay: '17/02/2024 – 06/04/2024',
    year: 2024,
    cycleLengthDays: 50,
    periodDurationDays: 6,
    cycleType: 'delayed_long',
    cycleTypeLabel: 'Chu kỳ dài (50 ngày)',
    clinicalNote: 'Biến thiên sinh lý tự nhiên do trễ phóng noãn.'
  },
  {
    id: 'cycle-2024-01',
    startDate: 'Jan 11, 2024',
    endDate: 'Feb 16, 2024',
    dateRangeDisplay: '11/01/2024 – 16/02/2024',
    year: 2024,
    cycleLengthDays: 37,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (37 ngày)',
    clinicalNote: 'Chu kỳ 37 ngày ổn định, hành kinh 5 ngày.'
  },

  // --- NĂM 2023 ---
  {
    id: 'cycle-2023-11',
    startDate: 'Dec 8, 2023',
    endDate: 'Jan 10, 2024',
    dateRangeDisplay: '08/12/2023 – 10/01/2024',
    year: 2023,
    cycleLengthDays: 34,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (34 ngày)',
    clinicalNote: 'Chu kỳ ổn định cuối năm 2023.'
  },
  {
    id: 'cycle-2023-10',
    startDate: 'Nov 19, 2023',
    endDate: 'Dec 7, 2023',
    dateRangeDisplay: '19/11/2023 – 07/12/2023',
    year: 2023,
    cycleLengthDays: 19,
    periodDurationDays: 5,
    cycleType: 'short_breakthrough',
    cycleTypeLabel: 'Chu kỳ ngắn đột xuất (19 ngày)',
    clinicalNote: 'Chu kỳ ngắn do thoái hóa sớm nang noãn.'
  },
  {
    id: 'cycle-2023-09',
    startDate: 'Oct 7, 2023',
    endDate: 'Nov 18, 2023',
    dateRangeDisplay: '07/10/2023 – 18/11/2023',
    year: 2023,
    cycleLengthDays: 43,
    periodDurationDays: 5,
    cycleType: 'delayed_long',
    cycleTypeLabel: 'Chu kỳ dài (43 ngày)',
    clinicalNote: 'Pha tăng sinh kéo dài tự nhiên.'
  },
  {
    id: 'cycle-2023-08',
    startDate: 'Sep 6, 2023',
    endDate: 'Oct 6, 2023',
    dateRangeDisplay: '06/09/2023 – 06/10/2023',
    year: 2023,
    cycleLengthDays: 31,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (31 ngày)',
    clinicalNote: 'Hành kinh 5 ngày đều đặn.'
  },
  {
    id: 'cycle-2023-07',
    startDate: 'Aug 7, 2023',
    endDate: 'Sep 5, 2023',
    dateRangeDisplay: '07/08/2023 – 05/09/2023',
    year: 2023,
    cycleLengthDays: 30,
    periodDurationDays: 5,
    cycleType: 'standard',
    cycleTypeLabel: 'Chu kỳ chuẩn (30 ngày)',
    clinicalNote: 'Chu kỳ 30 ngày lý tưởng.'
  },
  {
    id: 'cycle-2023-06',
    startDate: 'Jul 1, 2023',
    endDate: 'Aug 6, 2023',
    dateRangeDisplay: '01/07/2023 – 06/08/2023',
    year: 2023,
    cycleLengthDays: 37,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (37 ngày)',
    clinicalNote: 'Độ dài 37 ngày đều đặn.'
  },
  {
    id: 'cycle-2023-05',
    startDate: 'May 26, 2023',
    endDate: 'Jun 30, 2023',
    dateRangeDisplay: '26/05/2023 – 30/06/2023',
    year: 2023,
    cycleLengthDays: 36,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (36 ngày)',
    clinicalNote: 'Rất đều đặn, hành kinh đúng 5 ngày.'
  },
  {
    id: 'cycle-2023-04',
    startDate: 'Apr 15, 2023',
    endDate: 'May 25, 2023',
    dateRangeDisplay: '15/04/2023 – 25/05/2023',
    year: 2023,
    cycleLengthDays: 41,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (41 ngày)',
    clinicalNote: 'Pha nang noãn phát triển chậm, hoàng thể ổn định.'
  },
  {
    id: 'cycle-2023-03',
    startDate: 'Mar 9, 2023',
    endDate: 'Apr 14, 2023',
    dateRangeDisplay: '09/03/2023 – 14/04/2023',
    year: 2023,
    cycleLengthDays: 37,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (37 ngày)',
    clinicalNote: 'Độ dài 37 ngày lặp lại đều đặn.'
  },
  {
    id: 'cycle-2023-02',
    startDate: 'Jan 28, 2023',
    endDate: 'Mar 8, 2023',
    dateRangeDisplay: '28/01/2023 – 08/03/2023',
    year: 2023,
    cycleLengthDays: 40,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (40 ngày)',
    clinicalNote: 'Chu kỳ 40 ngày, hành kinh 5 ngày.'
  },
  {
    id: 'cycle-2023-01',
    startDate: 'Dec 20, 2022',
    endDate: 'Jan 27, 2023',
    dateRangeDisplay: '20/12/2022 – 27/01/2023',
    year: 2023,
    cycleLengthDays: 39,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (39 ngày)',
    clinicalNote: 'Chu kỳ ổn định chuyển giao năm.'
  },

  // --- NĂM 2022 ---
  {
    id: 'cycle-2022-05',
    startDate: 'Nov 10, 2022',
    endDate: 'Dec 19, 2022',
    dateRangeDisplay: '10/11/2022 – 19/12/2022',
    year: 2022,
    cycleLengthDays: 40,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (40 ngày)',
    clinicalNote: 'Chu kỳ 40 ngày, hành kinh 5 ngày.'
  },
  {
    id: 'cycle-2022-04',
    startDate: 'Oct 5, 2022',
    endDate: 'Nov 9, 2022',
    dateRangeDisplay: '05/10/2022 – 09/11/2022',
    year: 2022,
    cycleLengthDays: 36,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (36 ngày)',
    clinicalNote: 'Độ dài 36 ngày, hành kinh 5 ngày.'
  },
  {
    id: 'cycle-2022-03',
    startDate: 'Aug 30, 2022',
    endDate: 'Oct 4, 2022',
    dateRangeDisplay: '30/08/2022 – 04/10/2022',
    year: 2022,
    cycleLengthDays: 36,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (36 ngày)',
    clinicalNote: 'Chu kỳ ổn định mùa thu.'
  },
  {
    id: 'cycle-2022-02',
    startDate: 'Jul 25, 2022',
    endDate: 'Aug 29, 2022',
    dateRangeDisplay: '25/07/2022 – 29/08/2022',
    year: 2022,
    cycleLengthDays: 36,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (36 ngày)',
    clinicalNote: 'Chu kỳ 36 ngày liên tiếp.'
  },
  {
    id: 'cycle-2022-01',
    startDate: 'Jun 13, 2022',
    endDate: 'Jul 24, 2022',
    dateRangeDisplay: '13/06/2022 – 24/07/2022',
    year: 2022,
    cycleLengthDays: 42,
    periodDurationDays: 5,
    cycleType: 'normal_long',
    cycleTypeLabel: 'Chu kỳ dài sinh lý (42 ngày)',
    clinicalNote: 'Điểm khởi đầu ghi nhận theo dõi dài hạn.'
  }
];

export const historicalCycleStatistics: HistoricalCycleStats = {
  totalTrackedCycles: 43,
  trackingDurationYears: 'Theo dõi nhiều năm liên tục',
  averageCycleLength: 34.8,
  medianCycleLength: 35,
  shortestCycle: 17,
  longestCycle: 50,
  averagePeriodDuration: 5.0,
  longCyclePercentage: 84,
  ovulationWindowEstimate: 'Ngày 18 – 24 của chu kỳ (hoặc ngày 14-17 đối với chu kỳ 28-30 ngày)',
  clinicalConclusion: 'Cơ địa chu kỳ sinh lý ổn định và đều đặn qua các năm theo dõi. Chức năng nội tiết buồng trứng duy trì nhịp nhàng theo quy luật sinh học tự nhiên.'
};

export const historicalCycleClinicalInsights = [
  {
    title: '1. Quy Luật Sinh Học: Chu Kỳ Dài Sinh Lý (30 – 40 Ngày)',
    content: 'Độ dài chu kỳ dao động trong khoảng 28-42 ngày với số ngày hành kinh trung bình 5 ngày là đặc điểm sinh học tự nhiên hoàn toàn bình thường của nhiều phụ nữ.'
  },
  {
    title: '2. Cửa Sổ Rụng Trứng & Thay Đổi Niêm Mạc Tử Cung',
    content: 'Thời điểm rụng trứng thường xảy ra khoảng 14 ngày trước khi kỳ kinh tiếp theo bắt đầu. Sau khi phóng noãn, niêm mạc tử cung bước vào pha phân tiết dày lên tự nhiên (10-16mm) dưới tác động của Progesterone.'
  },
  {
    title: '3. Theo Dõi Lâm Sàng & Nhận Biết Triệu Chứng Sinh Lý',
    content: 'Việc ghi nhận đều đặn giúp nhận biết các triệu chứng lành tính như đốm cam quanh rụng trứng, căng tức ngực tiền kinh nguyệt (PMS) và phân biệt với các dấu hiệu bất thường.'
  }
];


