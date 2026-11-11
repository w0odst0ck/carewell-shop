export type ProductItem = { zh: string; en: string };
export type ProductCategory = {
  id: string;
  nameZh: string;
  nameEn: string;
  note: string;
  items: ProductItem[];
  count: number;
};

export const productCatalog = {
  "source": "莲墨瑾服装有限公司 · 在产能力",
  "note": "所列品类为可生产范围，具体规格（克重/层数/尺寸/包装）按需求定制",
  "categories": [
    {
      "id": "A",
      "nameZh": "防护服/手术衣类",
      "nameEn": "Protective Clothing & Surgical Gowns",
      "note": "连体/分体、SMS 复合、加厚防水，含无菌与非无菌",
      "items": [
        {
          "zh": "一次性防护服（连体/分体）",
          "en": "Disposable Protective Coverall (One-piece/Split)"
        },
        {
          "zh": "医用防护服",
          "en": "Medical Protective Suit"
        },
        {
          "zh": "无纺布防护服",
          "en": "Nonwoven Protective Suit"
        },
        {
          "zh": "SMS 防护服",
          "en": "SMS Protective Suit"
        },
        {
          "zh": "隔离服",
          "en": "Isolation Coverall"
        },
        {
          "zh": "一次性手术衣",
          "en": "Disposable Surgical Gown"
        },
        {
          "zh": "无菌手术衣",
          "en": "Sterile Surgical Gown"
        },
        {
          "zh": "手术袍",
          "en": "Surgical Gown"
        },
        {
          "zh": "手术衣加厚/防水",
          "en": "Reinforced/Waterproof Surgical Gown"
        },
        {
          "zh": "介入手术衣",
          "en": "Interventional Surgical Gown"
        },
        {
          "zh": "实验服",
          "en": "Lab Coat"
        },
        {
          "zh": "一次性 lab coat",
          "en": "Disposable Lab Coat"
        },
        {
          "zh": "无尘服（洁净车间）",
          "en": "Cleanroom Suit"
        }
      ],
      "count": 13
    },
    {
      "id": "B",
      "nameZh": "隔离衣类",
      "nameEn": "Isolation Gowns",
      "note": "AAMI 分级、反穿式、防水加厚，适配不同暴露风险",
      "items": [
        {
          "zh": "一次性隔离衣",
          "en": "Disposable Isolation Gown"
        },
        {
          "zh": "医用隔离衣",
          "en": "Medical Isolation Gown"
        },
        {
          "zh": "AAMI 隔离衣",
          "en": "AAMI Isolation Gown"
        },
        {
          "zh": "反穿隔离衣",
          "en": "Back-Tie Isolation Gown"
        },
        {
          "zh": "无纺布隔离衣",
          "en": "Nonwoven Isolation Gown"
        },
        {
          "zh": "加厚隔离衣",
          "en": "Reinforced Isolation Gown"
        },
        {
          "zh": "防水隔离衣",
          "en": "Waterproof Isolation Gown"
        }
      ],
      "count": 7
    },
    {
      "id": "C",
      "nameZh": "口罩类",
      "nameEn": "Masks",
      "note": "三层/四层、绑带/耳挂、KN95/FFP2，可贴牌",
      "items": [
        {
          "zh": "一次性医用口罩",
          "en": "Disposable Medical Mask"
        },
        {
          "zh": "外科口罩",
          "en": "Surgical Mask"
        },
        {
          "zh": "三层/四层口罩",
          "en": "3-Ply / 4-Ply Mask"
        },
        {
          "zh": "无纺布口罩",
          "en": "Nonwoven Mask"
        },
        {
          "zh": "KN95 / N95 / FFP2",
          "en": "KN95 / N95 / FFP2"
        },
        {
          "zh": "儿童口罩",
          "en": "Kids Mask"
        },
        {
          "zh": "绑带式口罩",
          "en": "Tie-on Mask"
        },
        {
          "zh": "防护面屏",
          "en": "Face Shield"
        },
        {
          "zh": "一次性面屏",
          "en": "Disposable Face Shield"
        },
        {
          "zh": "防护眼罩",
          "en": "Protective Goggles"
        }
      ],
      "count": 10
    },
    {
      "id": "D",
      "nameZh": "手套类",
      "nameEn": "Gloves",
      "note": "丁腈/乳胶/PVC/TPE，检查级与加厚级",
      "items": [
        {
          "zh": "丁腈手套（检查/加厚/无粉/蓝丁腈）",
          "en": "Nitrile Gloves (Exam/Reinforced/Powder-free/Blue)"
        },
        {
          "zh": "乳胶手套",
          "en": "Latex Gloves"
        },
        {
          "zh": "PVC 手套",
          "en": "PVC Gloves"
        },
        {
          "zh": "PE 手套",
          "en": "PE Gloves"
        },
        {
          "zh": "TPE 手套",
          "en": "TPE Gloves"
        },
        {
          "zh": "医疗检查手套",
          "en": "Medical Examination Gloves"
        },
        {
          "zh": "食品级手套",
          "en": "Food-Grade Gloves"
        },
        {
          "zh": "家务手套",
          "en": "Household Gloves"
        }
      ],
      "count": 8
    },
    {
      "id": "E",
      "nameZh": "帽/头套类",
      "nameEn": "Caps & Head Covers",
      "note": "条形帽、圆顶 Bouffant、医生帽、胡须套",
      "items": [
        {
          "zh": "无纺布帽",
          "en": "Nonwoven Cap"
        },
        {
          "zh": "条形帽",
          "en": "Strip Cap"
        },
        {
          "zh": "圆顶帽 Bouffant",
          "en": "Bouffant Cap"
        },
        {
          "zh": "手术帽",
          "en": "Surgical Cap"
        },
        {
          "zh": "医生帽",
          "en": "Doctor Cap"
        },
        {
          "zh": "发帽",
          "en": "Hair Cap"
        },
        {
          "zh": "一次性头套",
          "en": "Disposable Hood"
        },
        {
          "zh": "胡须套",
          "en": "Beard Cover"
        },
        {
          "zh": "一次性帽子（美容/餐饮用）",
          "en": "Disposable Cap (Beauty/Catering)"
        }
      ],
      "count": 9
    },
    {
      "id": "F",
      "nameZh": "鞋套/靴套类",
      "nameEn": "Shoe & Boot Covers",
      "note": "无纺布/PE、防滑底、加厚与长筒靴套",
      "items": [
        {
          "zh": "一次性鞋套（无纺布/PE/防滑/加厚）",
          "en": "Disposable Shoe Covers (Nonwoven/PE/Anti-slip/Reinforced)"
        },
        {
          "zh": "靴套",
          "en": "Boot Covers"
        },
        {
          "zh": "长筒靴套",
          "en": "Long Boot Covers"
        },
        {
          "zh": "实验室鞋套",
          "en": "Lab Shoe Covers"
        }
      ],
      "count": 4
    },
    {
      "id": "G",
      "nameZh": "手术单/洞巾/包布类",
      "nameEn": "Surgical Drapes & Wraps",
      "note": "手术单、洞巾、包布，可做无菌灭菌包装",
      "items": [
        {
          "zh": "一次性手术单",
          "en": "Disposable Surgical Drape"
        },
        {
          "zh": "洞巾",
          "en": "Fenestrated Drape"
        },
        {
          "zh": "医用洞巾",
          "en": "Medical Fenestrated Drape"
        },
        {
          "zh": "手术孔巾",
          "en": "Surgical Fenestrated Drape"
        },
        {
          "zh": "加厚手术单",
          "en": "Reinforced Surgical Drape"
        },
        {
          "zh": "防水手术单",
          "en": "Waterproof Surgical Drape"
        },
        {
          "zh": "无纺布包布",
          "en": "Nonwoven Wrap"
        },
        {
          "zh": "器械包布",
          "en": "Instrument Wrap"
        },
        {
          "zh": "消毒包布",
          "en": "Sterilization Wrap"
        },
        {
          "zh": "SMS 包布",
          "en": "SMS Wrap"
        }
      ],
      "count": 10
    },
    {
      "id": "H",
      "nameZh": "医用敷料类",
      "nameEn": "Medical Dressings",
      "note": "纱布、绷带、敷贴、护理垫，规格齐全",
      "items": [
        {
          "zh": "纱布片（脱脂/无纺布/加厚）",
          "en": "Gauze Pad (Absorbent/Nonwoven/Reinforced)"
        },
        {
          "zh": "纱布卷",
          "en": "Gauze Roll"
        },
        {
          "zh": "绷带（弹力/自粘/石膏衬垫）",
          "en": "Bandage (Elastic/Self-adhesive/Cast Padding)"
        },
        {
          "zh": "棉球",
          "en": "Cotton Ball"
        },
        {
          "zh": "棉签（医用/消毒）",
          "en": "Cotton Swab (Medical/Sterile)"
        },
        {
          "zh": "敷贴",
          "en": "Wound Dressing"
        },
        {
          "zh": "创可贴",
          "en": "Adhesive Bandage"
        },
        {
          "zh": "医用胶带（PE/无纺布/透气）",
          "en": "Medical Tape (PE/Nonwoven/Breathable)"
        },
        {
          "zh": "护理垫",
          "en": "Underpad"
        },
        {
          "zh": "医用垫单",
          "en": "Medical Bed Sheet"
        },
        {
          "zh": "吸水垫",
          "en": "Absorbent Pad"
        },
        {
          "zh": "产妇垫",
          "en": "Maternity Pad"
        },
        {
          "zh": "隔尿垫",
          "en": "Incontinence Pad"
        }
      ],
      "count": 13
    },
    {
      "id": "I",
      "nameZh": "一次性无纺布日用品/美容",
      "nameEn": "Nonwoven Daily & Beauty Products",
      "note": "美容/酒店/医院一次性耗材，克重可调",
      "items": [
        {
          "zh": "一次性床单/枕套（美容院/酒店/医院）",
          "en": "Disposable Bed Sheet/Pillowcase (Spa/Hotel/Hospital)"
        },
        {
          "zh": "无纺布浴巾/毛巾",
          "en": "Nonwoven Bath Towel"
        },
        {
          "zh": "压缩毛巾",
          "en": "Compressed Towel"
        },
        {
          "zh": "一次性围裙",
          "en": "Disposable Apron"
        },
        {
          "zh": "袖套",
          "en": "Sleeve Protector"
        },
        {
          "zh": "头巾",
          "en": "Head Scarf"
        },
        {
          "zh": "床垫纸",
          "en": "Mattress Paper"
        },
        {
          "zh": "面膜纸",
          "en": "Facial Mask Paper"
        },
        {
          "zh": "湿巾（消毒/清洁/医用）",
          "en": "Wet Wipes (Disinfecting/Cleaning/Medical)"
        },
        {
          "zh": "无纺布抹布",
          "en": "Nonwoven Cleaning Cloth"
        },
        {
          "zh": "擦手巾",
          "en": "Hand Towel"
        }
      ],
      "count": 11
    },
    {
      "id": "J",
      "nameZh": "围裙/袖套类",
      "nameEn": "Aprons & Sleeve Protectors",
      "note": "PE/无纺布围裙、袖套，餐饮与医用两线",
      "items": [
        {
          "zh": "一次性围裙（PE/无纺布/加厚）",
          "en": "Disposable Apron (PE/Nonwoven/Reinforced)"
        },
        {
          "zh": "手术围裙",
          "en": "Surgical Apron"
        },
        {
          "zh": "餐饮围裙",
          "en": "Catering Apron"
        },
        {
          "zh": "一次性袖套",
          "en": "Disposable Sleeve Protector"
        },
        {
          "zh": "医用袖套",
          "en": "Medical Sleeve Protector"
        },
        {
          "zh": "厨师袖套",
          "en": "Chef Sleeve Protector"
        }
      ],
      "count": 6
    },
    {
      "id": "K",
      "nameZh": "医疗包类（组件打包）",
      "nameEn": "Medical Kits",
      "note": "按手术类型组件打包，一包一用",
      "items": [
        {
          "zh": "一次性手术包",
          "en": "Disposable Surgical Pack"
        },
        {
          "zh": "换药包",
          "en": "Dressing Change Kit"
        },
        {
          "zh": "清创包",
          "en": "Debridement Kit"
        },
        {
          "zh": "介入包",
          "en": "Interventional Kit"
        },
        {
          "zh": "导尿包",
          "en": "Catheterization Kit"
        },
        {
          "zh": "缝合包",
          "en": "Suture Kit"
        },
        {
          "zh": "急救包",
          "en": "First Aid Kit"
        },
        {
          "zh": "检查包（口腔/妇科）",
          "en": "Examination Kit (Dental/Gynecology)"
        },
        {
          "zh": "护理包",
          "en": "Care Kit"
        }
      ],
      "count": 9
    },
    {
      "id": "L",
      "nameZh": "其他无纺布医疗",
      "nameEn": "Other Nonwoven Medical Products",
      "note": "备皮包、产包、护理用品及辅材",
      "items": [
        {
          "zh": "一次性备皮包",
          "en": "Skin Prep Kit"
        },
        {
          "zh": "一次性产包",
          "en": "Delivery Kit"
        },
        {
          "zh": "无菌包布卷",
          "en": "Sterile Wrap Roll"
        },
        {
          "zh": "纸尿裤/成人护理",
          "en": "Diaper / Adult Care"
        },
        {
          "zh": "卫生巾",
          "en": "Sanitary Napkin"
        },
        {
          "zh": "防护配件：防护服拉链/胶条（辅材）",
          "en": "Protective Accessories (Zippers/Tape)"
        }
      ],
      "count": 6
    }
  ],
  "totalCategories": 12,
  "totalItems": 106
} as const;
