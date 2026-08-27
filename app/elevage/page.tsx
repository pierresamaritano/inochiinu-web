'use client';

import { useState } from 'react';

interface Ancestor {
  name: string;
  titles?: string;
  details?: string;
  affix?: string;
}

interface DogPedigree {
  id: string;
  name: string;
  role: 'Étalon' | 'Lice';
  status: 'active' | 'upcoming';
  paternalLine: {
    label: string;
    father: Ancestor;
    origin?: string;
  };
  maternalLine: {
    label: string;
    mother: Ancestor;
    origin?: string;
  };
  tree: {
    father: Ancestor;
    mother: Ancestor;
    grandparents: {
      paternalFather: Ancestor;
      paternalMother: Ancestor;
      maternalFather: Ancestor;
      maternalMother: Ancestor;
    };
    greatGrandparents: {
      paternalFathersFather: Ancestor;
      paternalFathersMother: Ancestor;
      paternalMothersFather: Ancestor;
      paternalMothersMother: Ancestor;
      maternalFathersFather: Ancestor;
      maternalFathersMother: Ancestor;
      maternalMothersFather: Ancestor;
      maternalMothersMother: Ancestor;
    };
  };
}

const DOGS_DATA: DogPedigree[] = [
  {
    id: 'baiko',
    name: 'Baïko',
    role: 'Étalon',
    status: 'active',
    paternalLine: {
      label: 'Lignée Paternelle',
      origin: 'Import Pologne',
      father: {
        name: 'Katsunori Go Senshi Shimai',
        titles: 'CH Junior France • Titre CACIB',
        details: 'Descendant direct des affixes Senshi No Inu et Isegumo Kensha. Construction robuste et expression typique.'
      }
    },
    maternalLine: {
      label: 'Lignée Maternelle',
      origin: 'Affixe Kazan No',
      mother: {
        name: 'CH. Kazan No Teiumi',
        titles: 'Championne de France • Junior World Winner',
        details: 'Fille directe de CH. Kazan No Rumi (Championne de France et Hozonkai). Expression noble et tempérament calme.'
      }
    },
    tree: {
      father: {
        name: 'Katsunori Go Senshi Shimai',
        titles: 'CH Junior France'
      },
      mother: {
        name: 'CH. Kazan No Teiumi',
        titles: 'CH France'
      },
      grandparents: {
        paternalFather: { name: 'Ryuseimaru Go Isegumo Kensha' },
        paternalMother: { name: 'Aki Go Senshi Shimai' },
        maternalFather: { name: 'CH. Kazan No Rumi' },
        maternalMother: { name: 'Sayuri Go Kazan No' }
      },
      greatGrandparents: {
        paternalFathersFather: { name: 'Hiroyu Go Rokuhando Touwa' },
        paternalFathersMother: { name: 'Kiyomi Go' },
        paternalMothersFather: { name: 'Taishi Go' },
        paternalMothersMother: { name: 'Chiyo Go' },
        maternalFathersFather: { name: 'Kazan No Shingo' },
        maternalFathersMother: { name: 'Megumi Go' },
        maternalMothersFather: { name: 'Hachiko Go' },
        maternalMothersMother: { name: 'Yuki Go' }
      }
    }
  },
  {
    id: 'lice-1',
    name: 'Lice 1',
    role: 'Lice',
    status: 'upcoming',
    paternalLine: {
      label: 'Lignée Paternelle',
      origin: 'Lignée Sélectionnée',
      father: {
        name: 'Père de la Lice 1',
        titles: 'Certifié LOF • Cotation d’Élevage',
        details: 'Excellente tête, aplombs parfaits et tempérament stable.'
      }
    },
    maternalLine: {
      label: 'Lignée Maternelle',
      origin: 'Lignée Reconnue',
      mother: {
        name: 'Mère de la Lice 1',
        titles: 'Excellente en Exposition LOF',
        details: 'Lignée indemne de dysplasie et testée génétiquement.'
      }
    },
    tree: {
      father: { name: 'Père Lice 1 (À venir)' },
      mother: { name: 'Mère Lice 1 (À venir)' },
      grandparents: {
        paternalFather: { name: 'Grand-père P. (À venir)' },
        paternalMother: { name: 'Grand-mère P. (À venir)' },
        maternalFather: { name: 'Grand-père M. (À venir)' },
        maternalMother: { name: 'Grand-mère M. (À venir)' }
      },
      greatGrandparents: {
        paternalFathersFather: { name: 'Arrière G.P. 1' },
        paternalFathersMother: { name: 'Arrière G.M. 1' },
        paternalMothersFather: { name: 'Arrière G.P. 2' },
        paternalMothersMother: { name: 'Arrière G.M. 2' },
        maternalFathersFather: { name: 'Arrière G.P. 3' },
        maternalFathersMother: { name: 'Arrière G.M. 3' },
        maternalMothersFather: { name: 'Arrière G.P. 4' },
        maternalMothersMother: { name: 'Arrière G.M. 4' }
      }
    }
  },
  {
    id: 'lice-2',
    name: 'Lice 2',
    role: 'Lice',
    status: 'upcoming',
    paternalLine: {
      label: 'Lignée Paternelle',
      origin: 'Sélection Japonaise',
      father: {
        name: 'Père de la Lice 2',
        titles: 'Certifié LOF',
        details: 'En cours d’homologation.'
      }
    },
    maternalLine: {
      label: 'Lignée Maternelle',
      origin: 'Affixe Partenaire',
      mother: {
        name: 'Mère de la Lice 2',
        titles: 'Certifiée LOF',
        details: 'En cours d’homologation.'
      }
    },
    tree: {
      father: { name: 'Père Lice 2 (À venir)' },
      mother: { name: 'Mère Lice 2 (À venir)' },
      grandparents: {
        paternalFather: { name: 'Grand-père P.' },
        paternalMother: { name: 'Grand-mère P.' },
        maternalFather: { name: 'Grand-père M.' },
        maternalMother: { name: 'Grand-mère M.' }
      },
      greatGrandparents: {
        paternalFathersFather: { name: '—' },
        paternalFathersMother: { name: '—' },
        paternalMothersFather: { name: '—' },
        paternalMothersMother: { name: '—' },
        maternalFathersFather: { name: '—' },
        maternalFathersMother: { name: '—' },
        maternalMothersFather: { name: '—' },
        maternalMothersMother: { name: '—' }
      }
    }
  },
  {
    id: 'reproducteur-4',
    name: 'Futur Reproducteur',
    role: 'Lice',
    status: 'upcoming',
    paternalLine: {
      label: 'Lignée Paternelle',
      origin: 'À venir',
      father: {
        name: 'À déterminer',
        details: 'Informations publiées prochainement.'
      }
    },
    maternalLine: {
      label: 'Lignée Maternelle',
      origin: 'À venir',
      mother: {
        name: 'À déterminer',
        details: 'Informations publiées prochainement.'
      }
    },
    tree: {
      father: { name: 'À venir' },
      mother: { name: 'À venir' },
      grandparents: {
        paternalFather: { name: '—' },
        paternalMother: { name: '—' },
        maternalFather: { name: '—' },
        maternalMother: { name: '—' }
      },
      greatGrandparents: {
        paternalFathersFather: { name: '—' },
        paternalFathersMother: { name: '—' },
        paternalMothersFather: { name: '—' },
        paternalMothersMother: { name: '—' },
        maternalFathersFather: { name: '—' },
        maternalFathersMother: { name: '—' },
        maternalMothersFather: { name: '—' },
        maternalMothersMother: { name: '—' }
      }
    }
  },
  {
    id: 'reproducteur-5',
    name: 'Futur Reproducteur',
    role: 'Étalon',
    status: 'upcoming',
    paternalLine: {
      label: 'Lignée Paternelle',
      origin: 'À venir',
      father: {
        name: 'À déterminer',
        details: 'Informations publiées prochainement.'
      }
    },
    maternalLine: {
      label: 'Lignée Maternelle',
      origin: 'À venir',
      mother: {
        name: 'À déterminer',
        details: 'Informations publiées prochainement.'
      }
    },
    tree: {
      father: { name: 'À venir' },
      mother: { name: 'À venir' },
      grandparents: {
        paternalFather: { name: '—' },
        paternalMother: { name: '—' },
        maternalFather: { name: '—' },
        maternalMother: { name: '—' }
      },
      greatGrandparents: {
        paternalFathersFather: { name: '—' },
        paternalFathersMother: { name: '—' },
        paternalMothersFather: { name: '—' },
        paternalMothersMother: { name: '—' },
        maternalFathersFather: { name: '—' },
        maternalFathersMother: { name: '—' },
        maternalMothersFather: { name: '—' },
        maternalMothersMother: { name: '—' }
      }
    }
  }
];

export default function PedigreeSection() {
  const [selectedDogId, setSelectedDogId] = useState<string>(DOGS_DATA[0].id);
  const currentDog = DOGS_DATA.find((d) => d.id === selectedDogId) || DOGS_DATA[0];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      {/* En-tête avec titre et sélecteur d'onglets plats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-gray-100">
        <div>
          <span className="text-xs font-semibold tracking-wider text-amber-700 uppercase">
            Génétique & Standard Japonais
          </span>
          <h2 className="text-3xl font-bold text-gray-900 mt-1">
            Pedigree de nos reproducteurs LOF
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Consultez l'arbre généalogique officiel sur 3 générations de notre étalon et de nos lices.
          </p>
        </div>

        {/* Barre d'onglets : 5 boutons fixes */}
        <div className="flex flex-wrap gap-2">
          {DOGS_DATA.map((dog) => {
            const isSelected = dog.id === selectedDogId;
            return (
              <button
                key={dog.id}
                onClick={() => setSelectedDogId(dog.id)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-150 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                <span>{dog.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-neutral-800 text-stone-300'
                      : 'bg-stone-200 text-stone-500'
                  }`}
                >
                  {dog.role}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cartes Lignée Paternelle / Maternelle */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
        {/* Lignée Paternelle */}
        <div className="bg-stone-50/60 border border-stone-200/70 rounded-2xl p-6 relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {currentDog.paternalLine.label}
            </span>
            {currentDog.paternalLine.origin && (
              <span className="text-xs font-medium text-stone-400">
                {currentDog.paternalLine.origin}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            {currentDog.paternalLine.father.name}
          </h3>
          {currentDog.paternalLine.father.titles && (
            <p className="text-xs font-semibold text-amber-800 mt-1">
              {currentDog.paternalLine.father.titles}
            </p>
          )}
          {currentDog.paternalLine.father.details && (
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              {currentDog.paternalLine.father.details}
            </p>
          )}
        </div>

        {/* Lignée Maternelle */}
        <div className="bg-stone-50/60 border border-stone-200/70 rounded-2xl p-6 relative">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              {currentDog.maternalLine.label}
            </span>
            {currentDog.maternalLine.origin && (
              <span className="text-xs font-medium text-stone-400">
                {currentDog.maternalLine.origin}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-stone-900">
            {currentDog.maternalLine.mother.name}
          </h3>
          {currentDog.maternalLine.mother.titles && (
            <p className="text-xs font-semibold text-amber-800 mt-1">
              {currentDog.maternalLine.mother.titles}
            </p>
          )}
          {currentDog.maternalLine.mother.details && (
            <p className="text-xs text-stone-600 mt-3 leading-relaxed">
              {currentDog.maternalLine.mother.details}
            </p>
          )}
        </div>
      </div>

      {/* Arbre Généalogique Officiel sur 3 Générations */}
      <div className="border border-stone-200/80 rounded-2xl p-6 bg-white">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-stone-100">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-amber-700 uppercase block">
              Arbre Généalogique Officiel
            </span>
            <h4 className="text-base font-bold text-stone-900 mt-0.5">
              Pedigree certifié — {currentDog.name}
            </h4>
          </div>
          <span className="text-xs text-stone-400">Affixe Kazan No</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 1ère Génération (Parents) */}
          <div className="flex flex-col gap-4 justify-around">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              1ère Génération (Parents)
            </span>
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Père</span>
              <p className="text-xs font-bold text-stone-900 mt-0.5">{currentDog.tree.father.name}</p>
              {currentDog.tree.father.titles && (
                <p className="text-[11px] text-amber-700 mt-0.5">{currentDog.tree.father.titles}</p>
              )}
            </div>
            <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-100">
              <span className="text-[10px] font-bold text-stone-400 uppercase">Mère</span>
              <p className="text-xs font-bold text-stone-900 mt-0.5">{currentDog.tree.mother.name}</p>
              {currentDog.tree.mother.titles && (
                <p className="text-[11px] text-amber-700 mt-0.5">{currentDog.tree.mother.titles}</p>
              )}
            </div>
          </div>

          {/* 2ème Génération (Grands-parents) */}
          <div className="flex flex-col gap-3 justify-between">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              2ème Génération
            </span>
            <div className="bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
              <p className="text-xs font-medium text-stone-900">{currentDog.tree.grandparents.paternalFather.name}</p>
            </div>
            <div className="bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
              <p className="text-xs font-medium text-stone-900">{currentDog.tree.grandparents.paternalMother.name}</p>
            </div>
            <div className="bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
              <p className="text-xs font-medium text-stone-900">{currentDog.tree.grandparents.maternalFather.name}</p>
            </div>
            <div className="bg-stone-50/70 p-2.5 rounded-xl border border-stone-100">
              <p className="text-xs font-medium text-stone-900">{currentDog.tree.grandparents.maternalMother.name}</p>
            </div>
          </div>

          {/* 3ème Génération (Arrière-grands-parents) */}
          <div className="flex flex-col gap-2 justify-between">
            <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
              3ème Génération
            </span>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.paternalFathersFather.name}
            </div>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.paternalFathersMother.name}
            </div>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.paternalMothersFather.name}
            </div>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.paternalMothersMother.name}
            </div>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.maternalFathersFather.name}
            </div>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.maternalFathersMother.name}
            </div>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.maternalMothersFather.name}
            </div>
            <div className="bg-stone-50/40 p-2 rounded-lg border border-stone-100 text-[11px] text-stone-800">
              {currentDog.tree.greatGrandparents.maternalMothersMother.name}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
