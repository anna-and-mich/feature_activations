export type TokenRecord = {
  i: number;
  token_id: number;
  char_start: number;
  char_end: number;
  token_text: string;
  act: number;
};

export type FeatureExample = {
  feature_id: number;
  score: number;
  peak_activation: number;
  peak_token_index_in_window: number;
  problem_id: string | null;
  turn_index: number | null;
  solution_status: string | null;
  attempt_answer: any;
  reference_answer: any;
  text: string;
  highlight: {
    char_start: number;
    char_end: number;
    max_act_in_highlight: number;
    mean_act_in_highlight: number;
    active_token_indices: number[];
  };
  tokens: TokenRecord[];
};

export type FeatureEntry = {
  feature_id: number;
  num_examples: number;
  examples: FeatureExample[];
  mention_rate: number;
  nnz_count: number;
  mean_when_active: number;
};

export type Meta = {
  model_path: string;
  layer: number;
  sae_release: string;
  sae_id: string;
  features: number[];
  max_examples_per_feature: number;
  activation_threshold: number;
  min_active_width: number;
  max_window_width: number;
  buffer_tokens: number;
  max_tokens_per_turn: number;
  filters: {
    only_correct: boolean;
    only_with_answers: boolean;
    only_selected: boolean;
    turn: string;
    max_attempts: number;
  };
};

export type FeatureWindowsFile = {
  meta: Meta;
  features: Record<string, FeatureEntry>;
};
